export { InMemoryAnalyzer } from '@/services/static-analysis/InMemoryAnalyzer';
export { JavaScriptAnalyzer } from '@/services/static-analysis/analyzers/JavaScriptAnalyzer';
export { HTMLAnalyzer } from '@/services/static-analysis/analyzers/HTMLAnalyzer';
export { CSSAnalyzer } from '@/services/static-analysis/analyzers/CSSAnalyzer';
export type {
  IStaticAnalyzer,
  LanguageAnalyzer,
  FileInput,
} from '@/services/static-analysis/types';
