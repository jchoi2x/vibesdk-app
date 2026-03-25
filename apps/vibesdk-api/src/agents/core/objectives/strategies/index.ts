import type { ProjectType } from '@/agents/core/types';
import type { AdditionalExportStrategy } from '@/agents/core/objectives/strategies/types';
import { PresentationExportStrategy } from '@/agents/core/objectives/strategies/presentation';

export function getAdditionalExportStrategy(
  projectType: ProjectType,
): AdditionalExportStrategy | null {
  switch (projectType) {
    case 'presentation':
      return new PresentationExportStrategy();
    default:
      return null;
  }
}

export type {
  AdditionalExportStrategy,
  ExportContext,
} from '@/agents/core/objectives/strategies/types';
