import fs from 'fs';

import { octokit } from './github/client';
import { JIRAImport, Comment } from './model';
import { userMap } from './helpers/user-map';

const test = async () => {
  const jiraImport: JIRAImport = {
    projects: [{ name: 'Analytics', key: 'AN', issues: [] }],
  };

  const iterator = octokit.paginate.iterator(octokit.rest.issues.listForRepo, {
    owner: 'peeriq',
    repo: 'aqueduct',
    state: 'open',
    labels: 'jira',
    per_page: 100,
  });

  for await (const { data: issues } of iterator) {
    for (const issue of issues) {
      const comments: Comment[] = [];
      const iterator2 = octokit.paginate.iterator(octokit.rest.issues.listComments, {
        issue_number: issue.number,
        owner: 'peeriq',
        repo: 'aqueduct',
      });
      for await (const { data } of iterator2) {
        data.forEach((d) =>
          comments.push({ author: userMap.get(d.user.login), body: d.body, created: new Date(d.created_at) })
        );
      }
      jiraImport.projects[0].issues.push({
        summary: issue.title,
        externalId: issue.number.toString(),
        repo: 'aqueduct',
        description: issue.body,
        created: new Date(issue.created_at),
        issueType: 'Task',
        reporter: userMap.get(issue.user.login),
        status: 'TO DO',
        labels: issue.labels.map((l) => l.name),
        comments,
      });
      // console.log(JSON.stringify(jiraImport));
    }
  }
  fs.writeFile(__dirname + '/myjsonfile.json', JSON.stringify(jiraImport), 'utf-8', (err) => {
    if (err) {
      console.error(err.toString());
    } else {
      console.log('Done');
    }
  });

  // // iterate through each response
  // for await (const { data: issues } of iterator) {
  //   for (const issue of issues) {
  //     console.log('Issue #%d: %s', issue.number, issue.title);
  //   }
  // }

  // try {
  //   const { data } = await octokit.rest.issues.listForRepo({
  //     owner: 'peeriq',
  //     repo: 'aqueduct',
  //     state: 'open',
  //     per_page: 100,
  //   });
  //   data1 = data;
  // } catch (err) {
  //   console.error(err.toString());
  // }

  // const results = data1.map((d) => {
  //   return {
  //     body: d.body,
  //     created_by: d.user.login,
  //     id: d.id,
  //     repo: d.repository,
  //     comments: [],
  //   };
  // });

  // for await (const data of results) {
  //   try {
  //     const { data: res, headers } = await octokit.rest.issues.listComments({
  //       owner: 'peeriq',
  //       repo: 'aqueduct',
  //       issue_number: data.id,
  //     });
  //     results[data.id].comments.push(...res);
  //     fs.writeFileSync(__dirname + 'data.txt', JSON.stringify(results));
  //   } catch (err) {
  //     console.log(err.toString());
  //   }
  // }

  // console.log('Done');
};

const getUsers = async () => {
  try {
    const iterator = octokit.paginate.iterator(octokit.rest.orgs.listMembers, { org: 'peeriq' });
    let logins: Array<{ login: string; name: string }>;
    for await (const { data: users } of iterator) {
      logins = users.map((u) => {
        return { login: u.login, name: userMap.get(u.login) };
      });
    }
    console.log(logins);
  } catch (e) {
    console.error(e.toString());
  }
};

// test();
// getUsers();
