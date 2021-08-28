/**
 * Prompt for user input.
 */

export const prompt = async (msg: string) => {
  return new Promise<string>((resolve, reject) => {
    process.stdout.write(msg);
    process.stdin.setEncoding('utf8');
    process.stdin.once('data', (data) => resolve(data.toString().trim())).on('error', (err) => reject(err));
  });
};
