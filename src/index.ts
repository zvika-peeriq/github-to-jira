import { program } from 'commander';
import { Octokit } from '@octokit/rest';

import { exportGithubIssuesToJiraFormat } from './helpers/github';
import { exportToJson } from './helpers/export-to-json';
import { prompt } from './helpers';

interface Options {
  githubEnterprise: string;
  token: string;
  labels: string;
  organization: string;
  exportFileName: string;
  jiraProjectKey: string;
  jiraProjectName: string;
  state: 'all' | 'open' | 'closed';
  verbose: boolean;
}

program
  .option('-g, --githubEnterprise [https://api.github.my-company.com]', 'Your GitHub Enterprise URL.')
  .option('-t, --token [token]', 'The GitHub token. https://github.com/settings/tokens')
  .option('-l, --labels [jira,test]', 'Comma separated label to apply the filters on')
  .option('-o, --organization [organization]', 'The User or Organization slug that the repo lives under.')
  .option('-f, --exportFileName [export.csv]', 'The name of the JSON file to export to.')
  .option('-p, --jiraProjectName [Test Project]', 'The name of the project in JIRA')
  .option('-k, --jiraProjectKey [TPA]', 'The name of the project Key e.g TPA')
  .option('-s, --state [all,open,closed]', 'The state of the issue [all, open - Default, closed]')
  .option('-v, --verbose', 'Include additional logging information.')
  .action(async (options: Options) => {
    const retObject: Options = Object.create({});
    retObject.githubEnterprise = options.githubEnterprise || 'https://api.github.com';
    retObject.token = options.token || '';
    if (retObject.token === '') {
      retObject.token = await prompt('Token (get from https://github.com/settings/tokens): ');
    }
    retObject.exportFileName = options.exportFileName || undefined;

    retObject.organization = options.organization || '';
    if (retObject.organization === '') {
      retObject.organization = await prompt('User or Organization: ');
    }

    retObject.jiraProjectName = options.jiraProjectName || '';
    if (retObject.jiraProjectName === '') {
      retObject.jiraProjectName = await prompt('JIRA Project Name: ');
    }

    retObject.jiraProjectKey = options.jiraProjectKey || '';
    if (retObject.jiraProjectKey === '') {
      retObject.jiraProjectKey = await prompt('JIRA Key Name: ');
    }

    retObject.labels = options.labels || '';
    if (retObject.labels === '') {
      retObject.labels = await prompt('Labels [jira,client_name,etc.]: ');
    }

    retObject.state = options.state || undefined;
    if (retObject.state === undefined) {
      const response = await prompt('Labels [all,closed,open] - defaults to "open": ');
      if (['all', 'closed', 'open'].includes(response)) {
        retObject.state = response as 'all' | 'open' | 'closed';
      } else {
        retObject.state = 'open';
      }
    }

    retObject.verbose = options.verbose || false;

    const octokit = new Octokit({ auth: retObject.token });
    const jiraImport = await exportGithubIssuesToJiraFormat(
      {
        githubRepoOwner: retObject.organization,
        labels: retObject.labels,
        projectKey: retObject.jiraProjectKey,
        projectName: retObject.jiraProjectName,
        state: retObject.state,
        verbose: retObject.verbose,
      },
      octokit
    );
    exportToJson(retObject.organization, jiraImport, retObject.exportFileName);
  })
  .parse(process.argv);
