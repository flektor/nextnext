import path from 'path';
import fs from 'fs';
import { tokenize } from "./parser/tokenizer";
import { parseJsx, type Node } from './parser/jsxParser';

export function importComponent(filepath: string, root: boolean = true) {
  const filePath: string = path.join(__dirname, filepath);
  const code = fs.readFileSync(filePath, 'utf-8');

  let { element, imports: tempImports } = transformJSXToCreateElement(code)
  element = element.replace(/\bexport\b/g, '')

  let fileContent = element;

  for (const imp of tempImports) {
    // const module = imports.get(imp.module)
    // if (!module) continue;
    const js = importComponent(imp.module, false)
    fileContent += '\n\n' + js
  }
  return fileContent
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
function removeImportsFromContent(fileContent: string) {
  return fileContent.replace(/^\s*(import\s+.*?['"];?|(?:const|let|var)\s+[\w{}*,\s]+\s*=\s*require\(['"][^'"]+['"]\);?)\s*$/gm, '');
}

// const imports = new Map<string, string>()

function transformJSXToCreateElement(code: string) {
  const imports = findImports(code)

  code = removeImportsFromContent(code)

  const jsxBlockRegexMatcher = /<([a-zA-Z][\w-]*)[^>]*>([^]*?)<\/\1>|<[a-zA-Z][\w-]*[^>]*\/>/gs;
  const element = code.replace(jsxBlockRegexMatcher, match => {
    try {
      const tokens = tokenize(match).reverse();
      if (tokens.length === 0) return ''

      const ast = parseJsx(tokens)
      if (!ast) return ''

      const isComponent = ast.tag.match(/^[A-Z].*/);
      console.log({tag: ast.tag, isComponent})
      if (isComponent) {
        if (!ast.props) {
          return `${ast.tag}()`
        }

        const props = JSON.stringify(ast.props)
          .replace(/"(\w+)"\s*:/g, '$1:')  // Remove quotes from keys
          .replace(/:\s*"([^"]+)"/g, ': $1'); // Remove quotes from string values

        return `${ast.tag}(${props})`
      }

      const str = customStringify(ast)
      return `\ncreateElement(${str})`

    } catch (error) {
      console.error("Error processing JSX: ", match, error);
      return match; // fallback to original if error occurs
    }
  });

  return { element, imports };
}

function customStringify(obj: Node) {
  return JSON.stringify(obj, null, 2)
    .replace(/("on[A-Z][a-zA-Z]*"):\s*"([^"]+)"/g, '$1: $2') // Keeps the key quoted but removes quotes from values
    .replace(/"([^"]*{[^"]*})"/g, (_, content) =>
      "`" + content.replace(/{/g, "${") + "`"
    );
}