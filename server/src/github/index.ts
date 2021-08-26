import { Octokit } from 'octokit';
import { GITHUB_TOKEN } from '../helpers/constants';

export const octokit = new Octokit({ auth: GITHUB_TOKEN });
