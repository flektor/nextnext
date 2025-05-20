import fs from "fs";
import path from "path";
import { importPage as importAppComponent } from "./jsxFileReader";

export function indexPage(appComponentPath: string) {
  const App = importAppComponent(appComponentPath)

  return `<!DOCTYPE html>
  <html>
  <head>
    <style>
      ${injectStyles()}
    </style>
  </head>
  <body class='bg-primary' text='white'>
  <script>
    "use strict";
    
    document.body.classList.toggle("dark")

    ${injectSseClient()}
    ${injectSignals()} 
    ${injectCreateRef()} 
    ${App}

    document.body.appendChild(App())
    
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
// function injectCreateElement() {
//   const createElementFilePath = path.join(__dirname, './element.js');
//   const createElementCode = fs.readFileSync(createElementFilePath, 'utf-8');
//   return createElementCode.replace(/\bexport\b/g, '');
// }

function injectSignals() {
  const createElementFilePath = path.join(__dirname, './signals.js');
  const createElementCode = fs.readFileSync(createElementFilePath, 'utf-8');
  return createElementCode.replace(/\bexport\b/g, '');
}

function injectStyles() {
  const createElementFilePath = path.join(__dirname, 'styles.css');
  const createElementCode = fs.readFileSync(createElementFilePath, 'utf-8');
  return createElementCode.replace(/\bexport\b/g, '');
}

function injectSseClient() {
  const createElementFilePath = path.join(__dirname, './watcher/sseClient.js');
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