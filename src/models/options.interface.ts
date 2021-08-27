export interface GithubExportOptions {
  projectName: string;
  projectKey: string;
  githubRepoOwner: string;
  githubRepo?: string;
  state: 'all' | 'open' | 'closed' | undefined;
  labels: string | undefined;
  verbose: boolean;
}
