import type { BehaviorType, ProjectType, ExportOptions } from './agent';

export interface PlatformCapabilitiesConfig {
	features: {
		app: { enabled: boolean };
		presentation: { enabled: boolean };
		general: { enabled: boolean };
	};
	version: string;
}

export type ViewMode = 'editor' | 'preview' | 'docs' | 'blueprint' | 'terminal' | (string & {});

export interface FeatureCapabilities {
	hasPreview: boolean;
	hasLiveReload: boolean;
	requiresSandbox: boolean;
	requiresWebSocket: boolean;
	supportedViews: ViewMode[];
	defaultView: ViewMode;
	supportedExports: ExportOptions['kind'][];
	hasCustomHeaderActions: boolean;
	hasCustomSidebar: boolean;
	hasCustomFileFilter: boolean;
	behaviorType: BehaviorType;
}

export interface FeatureDefinition {
	id: ProjectType;
	name: string;
	description: string;
	enabled: boolean;
	capabilities: FeatureCapabilities;
	moduleUrl?: string;
}

export interface ViewDefinition {
	id: ViewMode;
	label: string;
	iconName: string;
	tooltip?: string;
}

export interface PlatformCapabilities {
	features: FeatureDefinition[];
	version: string;
}

export type CapabilitiesData = PlatformCapabilities;

export const DEFAULT_FEATURE_DEFINITIONS: Record<ProjectType, Omit<FeatureDefinition, 'enabled'>> = {
	app: {
		id: 'app',
		name: 'Application',
		description: 'Full-stack web applications',
		capabilities: {
			hasPreview: true,
			hasLiveReload: true,
			requiresSandbox: true,
			requiresWebSocket: true,
			supportedViews: ['editor', 'preview', 'docs', 'blueprint'],
			defaultView: 'editor',
			supportedExports: ['github'],
			hasCustomHeaderActions: true,
			hasCustomSidebar: false,
			hasCustomFileFilter: false,
			behaviorType: 'phasic',
		},
	},
	presentation: {
		id: 'presentation',
		name: 'Presentation',
		description: 'Interactive slide presentations',
		capabilities: {
			hasPreview: true,
			hasLiveReload: true,
			requiresSandbox: true,
			requiresWebSocket: true,
			supportedViews: ['editor', 'preview', 'docs'],
			defaultView: 'preview',
			supportedExports: ['github', 'pdf', 'pptx', 'googleslides'],
			hasCustomHeaderActions: true,
			hasCustomSidebar: true,
			hasCustomFileFilter: true,
			behaviorType: 'agentic',
		},
	},
	workflow: {
		id: 'workflow',
		name: 'Workflow',
		description: 'Automated workflows and pipelines',
		capabilities: {
			hasPreview: false,
			hasLiveReload: false,
			requiresSandbox: false,
			requiresWebSocket: true,
			supportedViews: ['editor', 'docs'],
			defaultView: 'editor',
			supportedExports: ['github', 'workflow'],
			hasCustomHeaderActions: true,
			hasCustomSidebar: false,
			hasCustomFileFilter: false,
			behaviorType: 'agentic',
		},
	},
	general: {
		id: 'general',
		name: 'General',
		description: 'General-purpose code generation',
		capabilities: {
			hasPreview: false,
			hasLiveReload: false,
			requiresSandbox: false,
			requiresWebSocket: true,
			supportedViews: ['editor', 'docs'],
			defaultView: 'editor',
			supportedExports: ['github'],
			hasCustomHeaderActions: false,
			hasCustomSidebar: false,
			hasCustomFileFilter: false,
			behaviorType: 'agentic',
		},
	},
};

export function getBehaviorTypeForProject(projectType: ProjectType): BehaviorType {
	return DEFAULT_FEATURE_DEFINITIONS[projectType].capabilities.behaviorType;
}
