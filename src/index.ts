import express, { Request, Response } from 'express';
import { importComponent } from './jsxFileReader';
import path from 'path';
import fs from 'fs'

const app = express();
const port = 3000;

function injectCreateElement() {
  const createElementFilePath: string = path.join(__dirname, '/element.js');
  const createElementCode = fs.readFileSync(createElementFilePath, 'utf-8');
  return createElementCode.replace(/\bexport\b/g, '');
}

function injectSignals() {
  const createElementFilePath: string = path.join(__dirname, '/signals.js');
  const createElementCode = fs.readFileSync(createElementFilePath, 'utf-8');
  return createElementCode.replace(/\bexport\b/g, '');
}



function indexPage() {
  return `<!DOCTYPE html>
  <html>
  <head>
    <link href="https://unpkg.com/tailwindcss@^1.2/dist/tailwind.min.css" rel="stylesheet">
  </head>
  <body class='bg-gray-800' text='white'>
    <script>
      "use strict";

      function createRef() {
        return { current: null }
      }

      // function attachRef<T extends HTMLElement>(ref: { current: T | null }, element: T) {
      function attachRef(ref, element) {
        ref.current = element;
        return ref
      }
      
      ${injectSignals()} 

      ${injectCreateElement()} 

      
      // const run = () => {
      //   ${importComponent('/App.jsx')} 
        
      //   const app = App()
      //   console.log(app)
      //   document.body.append(app)
      // }


      
      const run = () => {
        ${importComponent('/App.jsx')}

        const app = new  App();  
        console.log(app);
        document.body.append(app);
      }

      run()

    </script>
  </body>
  </html>`
}

app.get('/', (req: Request, res: Response) => {
  res.send(indexPage())
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
