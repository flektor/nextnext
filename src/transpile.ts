import { exec } from "child_process";
import { join } from "path";
import { pathToFileURL } from "url";

function runCommand(command: string): Promise<void> {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("Build error:", stderr);
        return reject(error);
      }
      resolve();
    });
  });
}

export async function transpile(filepath: string) {
  // await runCommand(`./node_modules/.bin/tsc ${filepath}.ts`);
  await runCommand(`./node_modules/.bin/tsc`);
  const compiledPath = join(__dirname, `../dist/${filepath.substring(5)}.js`);
  const fileUrl = pathToFileURL(compiledPath).href;
  return import(fileUrl);
}
 

