// Self-contained sandbox/agent types — no Zod or cross-app imports.
// These are explicit TypeScript interfaces mirroring the Zod-inferred shapes.

import type { ImageAttachment } from './images';

export interface FileTreeNode {
	path: string;
	type: 'file' | 'directory';
	children?: FileTreeNode[];
}

export interface RuntimeError {
	timestamp: string;
	level: number;
	message: string;
	rawOutput: string;
}

export interface TemplateInfo {
	name: string;
	frameworks?: string[];
	projectType: 'app' | 'workflow' | 'presentation' | 'general';
	description: {
		selection: string;
		usage: string;
	};
	renderMode?: 'sandbox' | 'browser';
	slideDirectory?: string;
	disabled: boolean;
}

export interface TemplateDetails extends TemplateInfo {
	fileTree: FileTreeNode;
	allFiles: Record<string, string>;
	deps: Record<string, string>;
	importantFiles: string[];
	dontTouchFiles: string[];
	redactedFiles: string[];
}

export interface PreviewType {
	runId?: string;
	previewURL?: string;
	tunnelURL?: string;
}

export type LintSeverity = 'error' | 'warning' | 'info';

export interface CodeIssue {
	message: string;
	filePath: string;
	line: number;
	column?: number;
	severity: LintSeverity;
	ruleId?: string;
	source?: string;
}

export interface CodeIssueResponse {
	issues: CodeIssue[];
	summary?: {
		errorCount: number;
		warningCount: number;
		infoCount: number;
	};
	rawOutput?: string;
}

export interface StaticAnalysisResponse {
	success: boolean;
	lint: CodeIssueResponse;
	typecheck: CodeIssueResponse;
	error?: string;
}

export const MAX_AGENT_QUERY_LENGTH = 20_000;

export interface AgentConnectionData {
	websocketUrl: string;
	agentId: string;
}

export type AgentPreviewResponse = PreviewType;

export interface CodeGenArgs {
	query: string;
	language?: string;
	frameworks?: string[];
	selectedTemplate?: string;
	behaviorType?: 'phasic' | 'agentic';
	projectType?: 'app' | 'workflow' | 'presentation' | 'general';
	images?: ImageAttachment[];
	credentials?: {
		providers?: Record<string, { apiKey: string }>;
		aiGateway?: { baseUrl: string; token: string };
	};
}
