import { Octokit } from 'octokit';
import { userMap } from '../user-map';

export const getUsersByGithubOrganization = async (org: string, octokit: Octokit) => {
  try {
    if (!org) {
      return new Error('Missing org paramter');
    }
    const iterator = octokit.paginate.iterator(octokit.rest.orgs.listMembers, { org });
    let logins: Array<{ login: string; name: string }>;
    for await (const { data: users } of iterator) {
      logins = users.map((u) => {
        return { login: u.login, name: userMap.get(u.login) };
      });
    }
    return logins;
  } catch (e) {
    console.error(e.toString());
  }
};
