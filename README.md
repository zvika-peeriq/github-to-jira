# Github Issue to Jira JSON

This project is inspired by (https://github.com/gavinr/github-csv-tools.git)
## Usage

Prerequisite: [Install Node.js](https://nodejs.org/en/), then run this to install:

```
npm install -g @tbadlov/github-to-jira
```

After install, `githubToJira --help` for info on how to use, or see below.

Instructions for exporting:

### To Export Issues

```
githubToJira
```

| Option                 | Default                                                                                               | Notes                                                                                                                                                                                                         |
| ---------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| -f, --exportFileName   | YYYY-MM-DD-hh-mm-ss-issues.json                                                                        | The name of the JSON you'd like to export to.                                                                                                                                                                  |

### Tokens

For all actions, the tool will ask you to input a GitHub token. To obtain this token:

1. Go to https://github.com/settings/tokens
2. Click "Generate New Token"
3. Check on `repo`
4. Copy/paste the token provided when the tool asks for it.

## Other Options

| Option                  | Notes                                                                         |
| ----------------------- | ------------------------------------------------------------------------------|
  -V, --version                                 | output the version number
  -g, --githubEnterprise                        | Your GitHub Enterprise URL.
  -t, --token [token]                           | The GitHub token. https://github.com/settings/tokens
  -l, --labels [jira,test]                      | Comma separated label to apply the filters on
  -o, --organization [organization]             | The User or Organization slug that the repo lives under.
  -f, --exportFileName [export.json]             | The name of the JSON file to export to.
  -p, --jiraProjectName [Test Project]          | The name of the project in JIRA
  -k, --jiraProjectKey [TPA]                    | The name of the project Key e.g TPA
  -s, --state [all,open,closed]                 | The state of the issue [all, open - Default, closed]
  -v, --verbose                                 | Include additional logging information.
  -h, --help                                    | display help for command

## Development

1. Clone the repo.
2. Browse to repo, then run `npm install -g`

## Changelog

See [CHANGELOG.md](https://github.com/zvika-peeriq/github-to-jira/blob/master/CHANGELOG.md)

## Thanks

- [octokit/rest.js](https://octokit.github.io/rest.js/)
- [commander](https://www.npmjs.com/package/commander)
- [gavinr](https://github.com/gavinr/)
