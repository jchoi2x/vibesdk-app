// Agent and code-generation types.
// Zod-inferred shapes from worker/agents/schemas.ts are defined as explicit interfaces here.

import type { CredentialsPayload } from './config';

export type BehaviorType = 'phasic' | 'agentic';
export type ProjectType = 'app' | 'workflow' | 'presentation' | 'general';
export type RuntimeType = 'sandbox' | 'worker' | 'none';

export type MessageRole = 'system' | 'user' | 'assistant' | 'function' | 'tool';

export type TextContent = { type: 'text'; text: string };
export type ImageContent = { type: 'image_url'; image_url: { url: string; detail?: 'auto' | 'low' | 'high' } };
export type MessageContent = string | (TextContent | ImageContent)[] | null;

export interface ConversationMessage {
	role: MessageRole;
	content: MessageContent;
	name?: string;
	tool_calls?: Array<{ id: string; type: 'function'; function: { name: string; arguments: string } }>;
	tool_call_id?: string;
	conversationId: string;
}

export interface ConversationState {
	id: string;
	runningHistory: ConversationMessage[];
	fullHistory: ConversationMessage[];
}

// Mirrors z.infer<typeof FileConceptSchema>
export interface FileConceptType {
	path: string;
	purpose: string;
	changes: string | null;
}

// Mirrors z.infer<typeof FileOutputSchema>
export interface FileOutputType {
	filePath: string;
	fileContents: string;
	filePurpose: string;
}

// Mirrors z.infer<typeof PhaseConceptSchema>
export interface PhaseConceptType {
	name: string;
	description: string;
	files: FileConceptType[];
	lastPhase: boolean;
}

// Mirrors z.infer<typeof CodeReviewOutput>
export interface CodeReviewOutputType {
	dependenciesNotMet: string[];
	issuesFound: boolean;
	frontendIssues: string[];
	backendIssues: string[];
	filesToFix: Array<{
		filePath: string;
		issues: string[];
		require_code_changes: boolean;
	}>;
	commands: string[];
}

// Base blueprint fields (SimpleBlueprintSchema)
interface SimpleBlueprintBase {
	title: string;
	projectName: string;
	description: string;
	colorPalette: string[];
	frameworks: string[];
}

// Mirrors z.infer<typeof PhasicBlueprintSchema>
export interface PhasicBlueprint extends SimpleBlueprintBase {
	detailedDescription: string;
	views: Array<{ name: string; description: string }>;
	userFlow: {
		uiLayout: string;
		uiDesign: string;
		userJourney: string;
	};
	dataFlow: string;
	architecture: {
		dataFlow: string;
	};
	pitfalls: string[];
	implementationRoadmap: Array<{ phase: string; description: string }>;
	initialPhase: PhaseConceptType;
}

// Mirrors z.infer<typeof AgenticBlueprintSchema>
export interface AgenticBlueprint extends SimpleBlueprintBase {
	plan: string[];
}

export type Blueprint = PhasicBlueprint | AgenticBlueprint;

// Mirrors TemplateSelection
export interface TemplateSelection {
	selectedTemplateName: string | null;
	reasoning: string;
	useCase: 'SaaS Product Website' | 'Dashboard' | 'Blog' | 'Portfolio' | 'E-Commerce' | 'General' | 'Other' | null;
	complexity: 'simple' | 'moderate' | 'complex' | null;
	styleSelection: 'Minimalist Design' | 'Brutalism' | 'Retro' | 'Illustrative' | 'Kid_Playful' | 'Custom' | null;
	projectType: ProjectType;
}

export enum CurrentDevState {
	IDLE,
	PHASE_GENERATING,
	PHASE_IMPLEMENTING,
	REVIEWING,
	FINALIZING,
}

export const MAX_PHASES = 10;

export interface FileState extends FileOutputType {
	lastDiff: string;
}

export interface PhaseState extends PhaseConceptType {
	completed: boolean;
}

interface BaseProjectState {
	behaviorType: BehaviorType;
	projectType: ProjectType;
	projectName: string;
	query: string;
	sessionId: string;
	hostname: string;
	blueprint: Blueprint;
	templateName: string | 'custom';
	shouldBeGenerating: boolean;
	generatedFilesMap: Record<string, FileState>;
	sandboxInstanceId?: string;
	commandsHistory?: string[];
	lastPackageJson?: string;
	pendingUserInputs: string[];
	projectUpdatesAccumulator: string[];
	lastDeepDebugTranscript: string | null;
	mvpGenerated: boolean;
	reviewingInitiated: boolean;
}

export interface PhasicState extends BaseProjectState {
	behaviorType: 'phasic';
	blueprint: PhasicBlueprint;
	generatedPhases: PhaseState[];
	phasesCounter: number;
	currentDevState: CurrentDevState;
	reviewCycles?: number;
	currentPhase?: PhaseConceptType;
}

export interface AgenticState extends BaseProjectState {
	behaviorType: 'agentic';
	blueprint: AgenticBlueprint;
	currentPlan: string;
}

export type AgentState = PhasicState | AgenticState;

export type DeepDebugResult =
	| { success: true; transcript: string }
	| { success: false; error: string };

export interface ExportOptions {
	kind: 'github' | 'pdf' | 'pptx' | 'googleslides' | 'workflow';
	format?: string;
	token?: string;
	metadata?: Record<string, unknown>;
}

export { type CredentialsPayload };
