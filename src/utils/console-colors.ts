export const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  yellow: "\x1b[33m",
  magenta: "\x1b[35m"
};

export function blue(text: string) {
  return `${colors.blue}${text}${colors.reset}`
}
 
export function magenta(text: string) {
  return `${colors.magenta}${text}${colors.reset}`
}

export function green(text: string) {
  return `${colors.green}${text}${colors.reset}`
}

export function yellow(text: string) {
  return `${colors.yellow}${text}${colors.reset}`
}

 