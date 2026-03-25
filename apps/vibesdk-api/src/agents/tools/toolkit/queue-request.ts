import { tool, t } from '@/agents/tools/types';
import { type StructuredLogger } from '@/logger';
import { type ICodingAgent } from '@/agents/services/interfaces/ICodingAgent';

export function createQueueRequestTool(
	agent: ICodingAgent,
	logger: StructuredLogger
) {
	return tool({
		name: 'queue_request',
		description:
			'Queue up modification requests or changes, to be implemented in the next development phase',
		args: {
			modificationRequest: t.string().describe("The changes needed to be made to the app. Please don't supply any code level or implementation details. Provide detailed requirements and description of the changes you want to make."),
		},
		run: async ({ modificationRequest }) => {
			logger.info('Received app edit request', {
				modificationRequest,
			});
			agent.queueUserRequest(modificationRequest);
			return null;
		},
	});
}
