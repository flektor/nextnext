import express, { Request, Response } from 'express';
// import './parser/jsxParser.test';
// import './parser/tokenizer.test';
import testSuite from './tinyTest'
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

export function indexPage() {
  return `<!DOCTYPE html>
  <html>
  <head>
    <link href="https://unpkg.com/tailwindcss@^1.2/dist/tailwind.min.css" rel="stylesheet">
  </head>
  <body>
      <script>
          ${injectCreateElement()} 
          
          ${importComponent('/App.jsx')} 
          
          const app = App()
          console.log(app)
          document.body.append(app)
      </script>
  </body>
  </html>`
}

app.get('/', (req: Request, res: Response) => {
  res.send(indexPage())
});

// testSuite.run();

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
