import { Octokit } from 'octokit';

const GITHUB_TOKEN = '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';

export const octokit = new Octokit({ auth: GITHUB_TOKEN });
