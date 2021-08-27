import fs from 'fs';
import path from 'path';
import { JIRAImport } from '../models';

export const exportToJson = (githubUser: string, jiraImport: JIRAImport, fileName?: string) => {
  // Create director if doesn't exist
  fs.mkdirSync(path.join(__dirname, '..', githubUser), { recursive: true });

  // Define a file path to store the file
  const now = new Date();
  const filePath = path.join(
    __dirname,
    '..',
    githubUser,
    `${fileName ? fileName : `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`}.json`
  );

  // write the JSON file to the file path
  fs.writeFileSync(filePath, JSON.stringify(jiraImport), { flag: 'wx' });
  console.log(`Created ${filePath}`);

  process.exit(0);
};
