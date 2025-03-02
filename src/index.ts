import express, { Request, Response } from 'express';
import { createElement } from './element';
import { parseJSX, type Node } from './parser/jsxParser';
// import './parser/jsxParser.test';
// import './parser/tokenizer.test';
import testSuite from './tinyTest'
import { parseJSFile } from './parser/babel/pureParser';
import path from 'path';
import fs from 'fs';

import { tokenize, TokenType } from "./parser/tokenizer";

const app = express();
const port = 3000;

app.get('/', (req: Request, res: Response) => {

  const html = `<!DOCTYPE html>
    <html>
    <body>
        <script>
            ${injectCreateElement()} 
            ${page('/App.jsx')}
            const app = App()
            console.log(app)
            document.body.append(app)
        </script>
    </body>
    </html>`

  res.send(html)
});

function customStringify(obj: Node) {
  return JSON.stringify(obj, null, 2)
    .replace(/("on[A-Z][a-zA-Z]*"):\s*"([^"]+)"/g, '$1: $2') // Keeps the key quoted but removes quotes from values
    .replace(/"([^"]*{[^"]*})"/g, (_, content) =>
      "`" + content.replace(/{/g, "${") + "`"
    );
}

function findImports(fileContent: string) {
  const importRegex = /import\s+(?:([\w*{}\s,]+)\s+from\s+)?['"]([^'"]+)['"]|const\s+([\w{}*]+)\s*=\s*require\(['"]([^'"]+)['"]\)/g;
  const imports = []
  let match;
  while ((match = importRegex.exec(fileContent)) !== null) {
    const name = match[1] || match[3] || "default"; // Imported names
    const module = match[2] || match[4]; // Module name
    //TODO adjust so it can import different names from diffrent places
    //atm the last place that imports the resource overiddes the names imported
    // +support 'somthing as somethingElse'
    // imports.set(module, name.trim());
    imports.push({ name: name.trim(), module });
  }

  return imports;
}
// ? why different regex for import / clean ?
function cleanImports(fileContent: string) {
  return fileContent.replace(/^\s*(import\s+.*?['"];?|(?:const|let|var)\s+[\w{}*,\s]+\s*=\s*require\(['"][^'"]+['"]\);?)\s*$/gm, '');
}

// const imports = new Map<string, string>()

function transformJSXToCreateElement(code: string) {
  const imports = findImports(code)

  code = cleanImports(code)

  const jsxBlockRegex = /<([a-zA-Z][\w-]*)[^>]*>([^]*?)<\/\1>|<[a-zA-Z][\w-]*[^>]*\/>/gs;

  const element = code.replace(jsxBlockRegex, match => {
    // console.log({ match })
    try {
      const tokens = tokenize(match).reverse();
      if (tokens.length === 0) return ''

      const json = parseJSX(tokens)
      if (!json) return ''

      const str = customStringify(json)

      return `\ncreateElement(${str})`

    } catch (error) {
      console.error("Error processing JSX: ", match, error);
      return match; // fallback to original if error occurs
    }
  });

  return { element, imports };
}

function injectCreateElement() {
  const createElementFilePath: string = path.join(__dirname, '/element.js');
  const createElementCode = fs.readFileSync(createElementFilePath, 'utf-8');
  return createElementCode.replace(/\bexport\b/g, '');
}

function page(filepath: string, root: boolean = true) {
  const filePath: string = path.join(__dirname, filepath);
  const code = fs.readFileSync(filePath, 'utf-8');

  let { element, imports: tempImports } = transformJSXToCreateElement(code)
  element = element.replace(/\bexport\b/g, '')

  let fileContent = element;

  for (const imp of tempImports) {
    // const module = imports.get(imp.module)
    // if (!module) continue;
    const html = page(imp.module, false)
    fileContent += '\n\n' + html
  }
  return fileContent
}

// testSuite.run();


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
