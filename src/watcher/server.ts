import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import { blue } from '../utils/console-colors'

let serverProcess: { kill: () => void }

function startServer(restart = false) {
  const restartFlag = restart ? '--restart' : ''
  serverProcess = spawn('ts-node', ['src/server.ts', restartFlag], { stdio: 'inherit' })
}

function restartServer() {
  if (serverProcess) {
    serverProcess.kill()
  }

  console.log(blue('[watcher] Transpiling..'))
  require('child_process').execSync('tsc', { stdio: 'inherit' })

  console.log(blue('[watcher] Restarting server..'))
  startServer(true)
}

const debouncedRestart = debounce(restartServer, 200)

function watchFiles(dir: string) {
  fs.watch(dir, { recursive: true, }, (eventType, filename) => {
    if (filename && /\.(ts|js)$/.test(filename)) {
      debouncedRestart()
    }
  })
}

const srcPath = path.join(__dirname, '..')
console.log(blue(`Watching path: ${path.join(srcPath, '*')}`))

startServer()

watchFiles(srcPath)

function debounce(fn: (...args: any[]) => void, delay: number) {
  let timer: NodeJS.Timeout
  return (...args: any[]) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}
