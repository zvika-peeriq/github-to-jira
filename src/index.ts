import { program } from 'commander';
import { co } from 'co';
import prompt from 'co-prompt';
import { exportGithubIssuesToJiraFormat } from './helpers/github';
import { exportToJson } from './helpers/export-to-json';
import { Octokit } from 'octokit';

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
  .version('1.0.0')
  .option('-g, --githubEnterprise [https://api.github.my-company.com]', 'Your GitHub Enterprise URL.')
  .option('-t, --token [token]', 'The GitHub token. https://github.com/settings/tokens')
  .option('-l, --labels [jira,test]', 'Comma separated label to apply the filters on')
  .option('-o, --organization [organization]', 'The User or Organization slug that the repo lives under.')
  .option('-f, --exportFileName [export.csv]', 'The name of the JSON file to export to.')
  .option('-p, --jiraProjectName [Test Project]', 'The name of the project in JIRA')
  .option('-k, --jiraProjectKey [TPA]', 'The name of the project Key e.g TPA')
  .option('-s, --state [all,open,closed]', 'The state of the issue [all, open - Default, closed]')
  .option('-v, --verbose', 'Include additional logging information.')
  .action((options: Options) => {
    co(function* () {
      const retObject: Options = Object.create({});
      retObject.githubEnterprise = options.githubEnterprise || 'https://api.github.com';
      retObject.token = options.token || '';
      if (retObject.token === '') {
        retObject.token = yield prompt('Token (get from https://github.com/settings/tokens): ');
      }
      retObject.exportFileName = options.exportFileName || undefined;

      retObject.organization = options.organization || '';
      if (retObject.organization === '') {
        retObject.organization = yield prompt('User or Organization: ');
      }

      retObject.jiraProjectName = options.jiraProjectName || '';
      if (retObject.jiraProjectName === '') {
        retObject.jiraProjectName = yield prompt('JIRA Project Name: ');
      }

      retObject.jiraProjectKey = options.jiraProjectKey || '';
      if (retObject.jiraProjectKey === '') {
        retObject.jiraProjectKey = yield prompt('JIRA Key Name: ');
      }

      retObject.labels = options.labels || '';
      if (retObject.labels === '') {
        retObject.labels = yield prompt('Labels [jira,all,test]: ');
      }

      retObject.verbose = options.verbose || false;

      return retObject;
    }).then(
      async (values: Options) => {
        const octokit = new Octokit({ auth: values.token });
        const jiraImport = await exportGithubIssuesToJiraFormat(
          {
            githubRepoOwner: values.organization,
            labels: values.labels,
            projectKey: values.jiraProjectKey,
            projectName: values.jiraProjectName,
            state: values.state || 'open',
            verbose: values.verbose,
          },
          octokit
        );
        exportToJson(values.organization, jiraImport, values.exportFileName);
      },
      (err) => {
        console.error('ERROR', err);
      }
    );
  })
  .parse(process.argv);
