import path from 'path';
import fs from 'fs';
import { createServer } from 'http';
import { importComponent } from './jsxFileReader';
import { SSEServer } from './hot-reload/sseServer';
import { loadEnvironmentVariables } from './utils/dotEnv';
import { printNodeRunningEnvironmentMessage, printServerUrl } from './utils/logger';

const { isDevMode, environment } = loadEnvironmentVariables(path.join(__dirname, '../.env'))

printNodeRunningEnvironmentMessage(environment)

const project = readProjectConfig();
const appComponentPath = path.join(project.root, project.main)
const sse = new SSEServer();

const server = createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    const App = importComponent(appComponentPath)
    res.end(indexPage(App));
  } else if (isDevMode && req.url === '/dev-mode-events') {
    sse.handler(req, res);
  } else {
    res.writeHead(404);
    res.end();
  }
});

fs.watch(project.root, { recursive: true }, (eventType, filename) => {
  if (filename) {
    sse.send('reload', { path: '/' });
  }
});

server.listen(process.env.PORT, () => {
  printServerUrl(process.env.PORT, environment)
});

function indexPage(App: string) {
  return `<!DOCTYPE html>
  <html>
  <header>
    <style>
      ${injectStyles()}
    </style>
  </header>
  <body class='bg-primary' text='white'>
  <script>
    "use strict";
    
    document.body.classList.toggle("dark")

    ${injectSseClient()}
    
    ${injectSignals()} 
    ${injectCreateElement()} 
    ${injectCreateRef()} 


    let appElement;

    function run() {
      ${App}
      if(appElement) {
        document.body.removeChild(appElement)
      } 
      appElement = new App()
      document.body.appendChild(appElement)
    }

    run()

    </script>
  </body>
  </html>`;
}

function injectCreateRef() {
  return `function createRef() {
    return { current: null }
  }

  function attachRef(ref, element) {
    ref.current = element;
    return ref
  }`;
}

function injectCreateElement() {
  const createElementFilePath = path.join(__dirname, 'element.js');
  const createElementCode = fs.readFileSync(createElementFilePath, 'utf-8');
  return createElementCode.replace(/\bexport\b/g, '');
}

function injectSignals() {
  const createElementFilePath = path.join(__dirname, 'signals.js');
  const createElementCode = fs.readFileSync(createElementFilePath, 'utf-8');
  return createElementCode.replace(/\bexport\b/g, '');
}

function injectStyles() {
  const createElementFilePath = path.join(__dirname, 'styles.css');
  const createElementCode = fs.readFileSync(createElementFilePath, 'utf-8');
  return createElementCode.replace(/\bexport\b/g, '');
}

function injectSseClient() {
  if (isDevMode) {
    const createElementFilePath = path.join(__dirname, 'hot-reload/sseClient.js');
    const createElementCode = fs.readFileSync(createElementFilePath, 'utf-8');
    const sseClientClassDefinition = createElementCode.replace(/\bexport\b/g, '');

    return sseClientClassDefinition + `
    const sse = new SSEClient('/dev-mode-events');

    sse.on('reload', () => {
      console.log('🔁 Reloading page...');
      window.location.href = window.location.href;
    })
  `
  }
}

function readProjectConfig() {
  try {
    const filePath = path.join(__dirname, '..', 'project.json');
    const rawData = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(rawData);
  } catch (err) {
    console.error(`Error reading project configurations: ${err}`);
    return null;
  }
}
