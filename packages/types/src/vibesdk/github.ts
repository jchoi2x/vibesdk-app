export interface GitHubExportOptions {
  repositoryName: string;
  description?: string;
  isPrivate: boolean;
  installationId?: number;
}

export interface GitHubExportResult {
  success: boolean;
  repositoryUrl?: string;
  cloneUrl?: string;
  token?: string;
  error?: string;
}
