import fs from 'fs';

import { octokit } from './services/github';
import { JIRAImport, Comment, GithubExportOptions } from './models';
import { userMap } from './helpers';
import { getRepositoriesByGithubOrganization } from './helpers/github/get-repos-by-org';

const exportGithubIssuesToJiraFormat = async (options: GithubExportOptions) => {
  // Start
  console.info('Started export with the following Options:');
  console.info(options);

  // Get list of repos to iterate through
  const repos: string[] = (await getRepositoriesByGithubOrganization(options.githubRepoOwner, 'private')) as string[];
  let fileIterator = 0;

  for (const repo of repos) {
    // Define Jira import object
    const jiraImport: JIRAImport = {
      projects: [{ name: options.projectName, key: options.projectKey, issues: [] }],
    };
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
            summary: issue.title,
            externalId: issue.number.toString(),
            repo: options.githubRepo,
            description: issue.body,
            created: new Date(issue.created_at),
            issueType: 'Task',
            reporter: userMap.get(issue.user.login),
            status: 'TO DO',
            labels: issue.labels.map((l) => l.name),
            comments,
          });
      }
      // Define a file path to store the file
      const now = new Date();
      const filePath = `../data/${options.githubRepoOwner}/${repo}/${now.getFullYear()}-${
        now.getMonth() + 1
      }-${now.getDate()}-${now.getTime()}.json`;

      // Create director if doesn't exist
      fs.mkdirSync(`../data/${options.githubRepoOwner}/${repo}/`, { recursive: true });
      // write the JSON file to the file path
      fs.writeFileSync(filePath, JSON.stringify(jiraImport), { flag: 'wx' });
      console.log(`Created ${filePath}`);
      fileIterator++;
    }
  }

  // Exit with message
  console.info(`Created ${fileIterator} Files`);
  process.exit();
};

exportGithubIssuesToJiraFormat({
  githubRepo: 'aqueduct',
  githubRepoOwner: 'peeriq',
  labels: 'jira',
  projectKey: 'AN',
  projectName: 'Analytics',
  state: 'open',
});
