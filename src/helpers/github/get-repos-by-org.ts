import { Octokit } from '@octokit/rest';

export const getRepositoriesByGithubOrganization = async (
  org: string,
  type: 'all' | 'private' | 'public',
  octokit: Octokit
) => {
  try {
    if (!org) {
      return new Error('Missing org paramter');
    }
    const reposIterator = octokit.paginate.iterator(octokit.rest.repos.listForOrg, {
      org,
      type,
      per_page: 100,
    });
    let repositories: string[];
    for await (const { data: repos } of reposIterator) {
      repositories = repos.map((repo) => repo.name);
    }
    return repositories;
  } catch (e) {
    console.error(e.toString());
    throw e;
  }
};
