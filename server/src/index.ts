import fs from 'fs';

import { octokit } from './github';
import { JIRAImport, Comment, GithubExportOptions } from './models';
import { userMap } from './helpers';

const exportGithubIssuesToJiraFormat = async (options: GithubExportOptions) => {
  // Start
  console.info('Started export with the following Options:');
  console.info(options);

  // Define Jira import object
  const jiraImport: JIRAImport = {
    projects: [{ name: options.projectName, key: options.projectKey, issues: [] }],
  };

  // Get all issues given a repo and filter by la
  const issuesIterator = octokit.paginate.iterator(octokit.rest.issues.listForRepo, {
    owner: options.githubRepoOwner,
    repo: options.githubRepo,
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
        repo: options.githubRepo,
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
  }

  // Define a file path to store the file
  const now = new Date();
  const filePath = `${__dirname}/${options.githubRepoOwner}/${
    options.githubRepo
  }/${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getTime()}.json`;

  // write the JSON file to the file path
  fs.writeFile(filePath, JSON.stringify(jiraImport), { flag: 'wx' }, (err) => {
    if (err) {
      console.error(err.toString());
      process.exit(1);
    }
  });
  // Exit with message
  console.info(`Created File: ${filePath}`);
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
