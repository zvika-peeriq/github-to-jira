import { JIRAImport, Comment, GithubExportOptions } from '../../models';
import { userMap } from '../../helpers';
import { getRepositoriesByGithubOrganization } from './get-repos-by-org';
import { Octokit } from 'octokit';

export const exportGithubIssuesToJiraFormat = async (options: GithubExportOptions, octokit: Octokit) => {
  // Start
  console.log('Export of Github Issues Started...');
  
  if (options.verbose) {
    console.info('Started export with the following Options:');
    console.info(options);
  }

  // Get list of Repositories to iterate through
  const repos: string[] = (await getRepositoriesByGithubOrganization(
    options.githubRepoOwner,
    'private',
    octokit
  )) as string[];

  // Define Jira import object
  const jiraImport: JIRAImport = {
    projects: [{ name: options.projectName, key: options.projectKey, issues: [] }],
  };

  for (const repo of repos) {
    // Get all issues given a repo and filter by labels
    const issuesIterator = octokit.paginate.iterator(octokit.rest.issues.listForRepo, {
      owner: options.githubRepoOwner,
      repo,
      state: options.state,
      labels: options.labels || undefined,
      per_page: 100,
    });

    // Iterate on the issues
    for await (const { data: issues } of issuesIterator) {
      for (const issue of issues) {
        // Define a Comments array
        const comments: Comment[] = [];
        // Iterate through all comments for a given issue number
        const commentsIterator = octokit.paginate.iterator(octokit.rest.issues.listComments, {
          issue_number: issue.number,
          owner: options.githubRepoOwner,
          repo,
        });
        for await (const { data: commentsResponse } of commentsIterator) {
          // If a comment exit push it to the comments object
          commentsResponse.forEach((comment) =>
            comments.push({
              author: userMap.get(comment.user.login),
              body: comment.body,
              created: new Date(comment.created_at),
            })
          );
        }
        // Push the issue and comments to the Jira Import Object
        jiraImport.projects
          .find((project) => project.name === options.projectName)
          .issues.push({
            assignee: userMap.get(issue.assignee?.login),
            watchers: [...issue.assignees?.map((assignee) => userMap.get(assignee?.login))],
            summary: issue.title,
            externalId: issue.number.toString(),
            repo: options.githubRepo,
            description: issue.body,
            created: new Date(issue.created_at),
            issueType: 'Task',
            reporter: userMap.get(issue.user.login),
            status: 'TO DO',
            labels: [...issue.labels.map((l) => l.name), repo],
            comments,
          });
      }
    }
  }
  return jiraImport;
};
