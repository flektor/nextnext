import path from 'path'
import fs from 'fs'
import { createServer } from 'http'
import { SSEServer } from './watcher/sseServer'
import { loadEnvironmentVariables } from './utils/dotEnv'
import { indexPage } from './indexPage'
import { blue, green, magenta, yellow } from './utils/console-colors'
import { printServerUrl } from './utils/logger'
import { importPage as importAppComponent } from "./jsxFileReader";

const project = readProjectConfig()
const appComponentPath = path.join(project.root, project.main)

const { isDevMode, environment } = loadEnvironmentVariables(path.join(__dirname, '../.env'))

const args = process.argv.slice(2)
const isRestart = args.includes('--restart')

if (!isRestart) {
  logServerStartingMessage(environment, [path.join(project.root, '*')])
}

const sse = isDevMode ? new SSEServer() : null

const server = createServer(async (req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' })

    const App = importAppComponent(appComponentPath)
    const html = indexPage(App)

    res.end(html)

  } else if (isDevMode && req.url === '/dev-mode-events') {
    sse!.handler(req, res)
  } else {
    res.writeHead(404)
    res.end()
  }
})

server.listen(process.env.PORT, () => {
  if (!isRestart) {
    printServerUrl(process.env.PORT, environment)
  }
})

/* hot reload! It reloads app page on client side) */
if (isDevMode) {
  const reloadClient = () => {
    console.log(blue('[watcher] Reloading client..'))
    sse?.send('reload', { path: '/' })
  }
  const debouncedReloadClient = debounce(reloadClient, 200)

  fs.watch(project.root, { recursive: true }, (eventType, filename) => {
    if (filename) {
      debouncedReloadClient()
    }
  })
}

/* 
  The OS or editor writes files — often in multiple steps (like write + rename 
  or metadata update), so on file change can trigger two event. To prevent that
  we want to debounce the previous restart and restart again.
*/
export function debounce(fn: (...args: any[]) => void, delay: number) {
  let timer: NodeJS.Timeout
  return (...args: any[]) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

function readProjectConfig() {
  try {
    const filePath = path.join(__dirname, '..', 'project.json')
    const rawData = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(rawData)
  } catch (err) {
    console.error(`Error reading project configurations: ${err}`)
    return null
  }
}

function logServerStartingMessage(mode: string, watchingPaths: string[]): void {
  switch (mode) {
    case 'production':
      return console.log(green(`🚀  Server is running in‼️  PRODUCTION‼️  mode`))
    case 'development':
      console.log(blue(`🛠️  Server is running in dev mode`))
      const pathsStr = watchingPaths.length > 1 ? 'paths' : 'path'
      return console.log(blue(` - watching ${pathsStr}: ${watchingPaths.join(', ')}`))
    case 'test':
      return console.log(yellow(`🧪  Server is running in test mode`))
    default:
      return console.log(magenta(`🤷  Server is running in ? ${mode} mode ?`))
  }
} 