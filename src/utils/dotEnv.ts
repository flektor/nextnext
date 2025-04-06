import fs from "fs"
import path from "path"
import { blue, green, magenta, yellow } from "./console-colors";

const node_environments = ['development', 'production']

export function loadEnvironmentVariables(filePath = '.env') {

  const envPath = path.resolve(__dirname, filePath);

  if (!fs.existsSync(envPath)) {
    throw new Error(magenta(`🤷 No .env file found at ${envPath}`))
  }

  const lines: string[] = fs.readFileSync(envPath, 'utf-8').split('\n');

  lines.forEach(line => {
    const cleaned = line.trim();

    if (!cleaned || cleaned.startsWith('#')) return; // skip empty lines and comments

    const [key, ...valueParts] = cleaned.split('=');
    const value = valueParts.join('=').trim().replace(/^['"]|['"]$/g, '');

    if (key === 'NODE_ENV') {
      if (!node_environments.includes(value)) {

        throw new Error(magenta(`NODE_ENV environment variable has incorrect value: ${value}\nCheck .env file!`))
      }
     }


    if (!process.env[key]) {
      process.env[key] = value;
    }
  });

  if (process.env['NODE_ENV'] === undefined) {
    throw new Error(magenta(`NODE_ENV environment variable is missing!\nCheck .env file!`))
  }

  return {
    isProduction: process.env['NODE_ENV'] === 'production',
    isDevMode: process.env['NODE_ENV'] === 'development',
    isTestMode: process.env['NODE_ENV'] === 'test',
    environment: process.env['NODE_ENV']
  }
}
