import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables from .env file, where API keys and passwords are configured
if (fs.existsSync('.env')) {
  console.debug('Using .env file to supply config environment variables');
  dotenv.config({ path: '.env' });
} else {
  // if an .env file is not configured the application will default to the node variables.
  console.info('No .env file detected using node environment variables');
}

// Mandatory Env Variables Setup
export const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;
export const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!JIRA_API_TOKEN) {
  console.info('No JIRA_API_TOKEN provided.');
  process.exit(1);
}
if (!GITHUB_TOKEN) {
  console.info('No GITHUB_TOKEN provided.');
  process.exit(1);
}
