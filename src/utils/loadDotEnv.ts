import fs from "fs"
import path from "path"

const node_environments = ['development', 'production']

const COLORS = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  yellow: "\x1b[33m",
  magenta: "\x1b[35m"
};


export default function loadEnvironmentVariables(filePath = '.env') {

  const envPath = path.resolve(__dirname, filePath);

  if (!fs.existsSync(envPath)) {
     throw new Error(`${COLORS.magenta}🤷 No .env file found at ${envPath}${COLORS.reset}`)
  }

  const lines: string[] = fs.readFileSync(envPath, 'utf-8').split('\n');

  lines.forEach(line => {
    const cleaned = line.trim();

    if (!cleaned || cleaned.startsWith('#')) return; // skip empty lines and comments

    const [key, ...valueParts] = cleaned.split('=');
    const value = valueParts.join('=').trim().replace(/^['"]|['"]$/g, '');

    if (key === 'NODE_ENV') {
      if (!node_environments.includes(value)) {

        throw new Error(`🤷 ${COLORS.magenta}NODE_ENV environment variable has incorrect value: ${value}\nCheck .env file!${COLORS.reset}`)
      }

      printNodeRunningEnvironmentMessage(value)
    }


    if (!process.env[key]) {
      process.env[key] = value;
    }
  });

  if (process.env['NODE_ENV'] === undefined) {
    throw new Error(`🤷 ${COLORS.magenta}NODE_ENV environment variable is missing!\nCheck .env file!${COLORS.reset}`)
  }

  return {
    isProduction: process.env['NODE_ENV'] === 'production',
    isDevMode: process.env['NODE_ENV'] === 'development',
    isTestMode: process.env['NODE_ENV'] === 'test',
  }
}


function printNodeRunningEnvironmentMessage(mode: string) {
  let color, emoji;

  switch (mode) {
    case 'production':
      color = COLORS.green;
      emoji = '🚀';
      break;
    case 'development':
      color = COLORS.blue;
      emoji = '🛠️';
      break;
    case 'test':
      color = COLORS.yellow;
      emoji = '🧪';
      break;
    default:
      color = COLORS.magenta;
      emoji = '🤷';
  }

  console.info(`${emoji}  ${color}Server runs in ${mode} mode!${COLORS.reset}`);
}
