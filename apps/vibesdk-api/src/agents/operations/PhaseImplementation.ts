import { type PhaseConceptType, type FileOutputType } from '@/agents/schemas';
import { type IssueReport } from '@/agents/domain/values/IssueReport';
import { createUserMessage, createMultiModalUserMessage } from '@/agents/inferutils/common';
import { executeInference } from '@/agents/inferutils/infer';
import { type CodeGenerationStreamingState } from '@/agents/output-formats/streaming-formats/base';
import { FileProcessing } from '@/agents/domain/pure/FileProcessing';
import { AgentOperation, getSystemPromptWithProjectContext, type OperationOptions } from '@/agents/operations/common';
import { SCOFFormat, type SCOFParsingState } from '@/agents/output-formats/streaming-formats/scof';
import { IsRealtimeCodeFixerEnabled, RealtimeCodeFixer } from '@/agents/assistants/realtimeCodeFixer';
import { CodeSerializerType } from '@/agents/utils/codeSerializers';
import type { UserContext } from '@/agents/core/types';
import { imagesToBase64 } from '@/utils/images';
import { type PhasicGenerationContext } from '@/agents/domain/values/GenerationContext';
import {
	PHASE_IMPLEMENTATION_SYSTEM_PROMPT,
	buildPhaseImplementationUserPrompt,
} from '@/agents/operations/prompts/phaseImplementationPrompts';

export interface PhaseImplementationInputs {
    phase: PhaseConceptType
    issues: IssueReport
    isFirstPhase: boolean
    shouldAutoFix: boolean
    userContext?: UserContext;
    fileGeneratingCallback: (filePath: string, filePurpose: string) => void
    fileChunkGeneratedCallback: (filePath: string, chunk: string, format: 'full_content' | 'unified_diff') => void
    fileClosedCallback: (file: FileOutputType, message: string) => void
}

export interface PhaseImplementationOutputs{
    // rawFiles: FileOutputType[]
    fixedFilePromises: Promise<FileOutputType>[]
    deploymentNeeded: boolean
    commands: string[]
}

export class PhaseImplementationOperation extends AgentOperation<PhasicGenerationContext, PhaseImplementationInputs, PhaseImplementationOutputs> {
    async execute(
        inputs: PhaseImplementationInputs,
        options: OperationOptions<PhasicGenerationContext>
    ): Promise<PhaseImplementationOutputs> {
        const { phase, issues, userContext } = inputs;
        const { env, logger, context } = options;

        logger.info(`Generating files for phase: ${phase.name}`, phase.description, "files:", phase.files.map(f => f.path));

        const codeGenerationFormat = new SCOFFormat();

        // Build messages for generation
        const messages = getSystemPromptWithProjectContext(PHASE_IMPLEMENTATION_SYSTEM_PROMPT, context, CodeSerializerType.SCOF, false);

        // Create user message with optional images
        const userPrompt = buildPhaseImplementationUserPrompt({ phase, issues, userContext }) + codeGenerationFormat.formatInstructions();
        const userMessage = userContext?.images && userContext.images.length > 0
            ? createMultiModalUserMessage(
                userPrompt,
                await imagesToBase64(env, userContext?.images),
                'high'
            )
            : createUserMessage(userPrompt);

        messages.push(userMessage);

        // Initialize streaming state
        const streamingState: CodeGenerationStreamingState = {
            accumulator: '',
            completedFiles: new Map(),
            parsingState: {} as SCOFParsingState
        };

        const fixedFilePromises: Promise<FileOutputType>[] = [];

        const agentActionName = inputs.isFirstPhase ? 'firstPhaseImplementation' : 'phaseImplementation';

        const shouldEnableRealtimeCodeFixer = inputs.shouldAutoFix && IsRealtimeCodeFixerEnabled(options.inferenceContext);

        // Execute inference with streaming
        await executeInference({
            env: env,
            agentActionName,
            context: options.inferenceContext,
            messages,
            stream: {
                chunk_size: 256,
                onChunk: (chunk: string) => {
                    codeGenerationFormat.parseStreamingChunks(
                        chunk,
                        streamingState,
                        // File generation started
                        (filePath: string) => {
                            logger.info(`Starting generation of file: ${filePath}`);
                            inputs.fileGeneratingCallback(filePath, FileProcessing.findFilePurpose(filePath, phase, context.allFiles.reduce((acc, f) => ({ ...acc, [f.filePath]: f }), {})));
                        },
                        // Stream file content chunks
                        (filePath: string, fileChunk: string, format: 'full_content' | 'unified_diff') => {
                            inputs.fileChunkGeneratedCallback(filePath, fileChunk, format);
                        },
                        // onFileClose callback
                        (filePath: string) => {
                            logger.info(`Completed generation of file: ${filePath}`);
                            const completedFile = streamingState.completedFiles.get(filePath);
                            if (!completedFile) {
                                logger.error(`Completed file not found: ${filePath}`);
                                return;
                            }

                            // Process the file contents
                            const originalContents = context.allFiles.find(f => f.filePath === filePath)?.fileContents || '';
                            completedFile.fileContents = FileProcessing.processGeneratedFileContents(
                                completedFile,
                                originalContents,
                                logger
                            );

                            const generatedFile: FileOutputType = {
                                ...completedFile,
                                filePurpose: FileProcessing.findFilePurpose(
                                    filePath,
                                    phase,
                                    context.allFiles.reduce((acc, f) => ({ ...acc, [f.filePath]: f }), {})
                                )
                            };

                            if (shouldEnableRealtimeCodeFixer && generatedFile.fileContents.split('\n').length > 50) {
                                // Call realtime code fixer immediately - this is the "realtime" aspect
                                const realtimeCodeFixer = new RealtimeCodeFixer(env, options.inferenceContext);
                                const fixPromise = realtimeCodeFixer.run(
                                    generatedFile,
                                    {
                                        query: context.query,
                                        template: context.templateDetails
                                    },
                                    phase
                                );
                                fixedFilePromises.push(fixPromise);
                            } else {
                                fixedFilePromises.push(Promise.resolve(generatedFile));
                            }

                            inputs.fileClosedCallback(generatedFile, `Completed generation of ${filePath}`);
                        }
                    );
                }
            }
        });

        const commands = streamingState.parsingState.extractedInstallCommands;

        logger.info("Files generated for phase:", phase.name, "with", fixedFilePromises.length, "files being fixed in real-time and extracted install commands:", commands);

        return {
            fixedFilePromises,
            deploymentNeeded: fixedFilePromises.length > 0,
            commands,
        };
    }
}
