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

    function isElement(obj) {
      try {
        //Using W3 DOM2 (works for FF, Opera and Chrome)
        return obj instanceof HTMLElement;
      }
      catch(e){
        //Browsers not supporting W3 DOM2 don't have HTMLElement and
        //an exception is thrown and we end up here. Testing some
        //properties that all elements have (works on IE7)
        return (typeof obj==="object") &&
          (obj.nodeType===1) && (typeof obj.style === "object") &&
          (typeof obj.ownerDocument ==="object");
      }
    }

    function appendContent(parent, content) {
      if (Array.isArray(content)) {
        return parent.append(...content)
      }
      parent.appendChild(content)
    }

    function getComputedContent(content) {
      return isElement(content) ? content : document.createTextNode(content)
    }

    ${App}

    document.body.appendChild(App())
    
    </script>
  </body>
  </html>`;
}

function injectCreateRef() {
  return `function createRef() {
    return { current: null }
  }`;
}

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