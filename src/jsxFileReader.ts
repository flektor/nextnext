import path from 'path';
import fs from 'fs';
import { tokenize } from "./parser/tokenizer";
import { parseJsx, Props, type Node } from './parser/jsxParser';

export function importComponent(filepath: string, root: boolean = true) {
  const filePath: string = path.join(__dirname, filepath);
  const code = fs.readFileSync(filePath, 'utf-8');

  let { element, imports: tempImports } = transformJsxToCreateElement(code)
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

const Regex = {
  IMPORTS_MATCHER: /import\s+(?:([\w*{}\s,]+)\s+from\s+)?['"]([^'"]+)['"]|const\s+([\w{}*]+)\s*=\s*require\(['"]([^'"]+)['"]\)/g,
  JSX_MATCHER: /<([a-zA-Z][\w-]*)[^>]*>([^]*?)<\/\1>|<[a-zA-Z][\w-]*[^>]*\/>/gs,
  COMPONENT_TAG: /^[A-Z].*/,
} as const


function findImports(fileContent: string) {
  const imports = []
  let match;
  while ((match = Regex.IMPORTS_MATCHER.exec(fileContent)) !== null) {
    const name = match[1] || match[3] || "default"; // Imported names
    const module = match[2] || match[4]; // Module name
    //TODO adjust so it can import different names from diffrent places
    //atm the last place that imports the resource overiddes the names imported
    // +support 'somthing as somethingElse'
    // imports.set(module, name.trim());
    imports.push({ name: name.trim(), module })
  }

  return imports
} 

// const imports = new Map<string, string>()

function transformJsxToCreateElement(code: string) {
  const imports = findImports(code)

  code = code.replace(Regex.IMPORTS_MATCHER, '')

  const element = code.replace(Regex.JSX_MATCHER, match => {
    try {
      const tokens = tokenize(match).reverse()
      if (tokens.length === 0) return '';

      const ast = parseJsx(tokens)
      if (!ast) return '';

      const isComponent = ast.tag.match(Regex.COMPONENT_TAG)
      console.log({ tag: ast.tag, isComponent })

      if (isComponent) {
        if (!ast.props) return `${ast.tag}()`;

        const componentProps = removeQuotesFromKeysAndValues(ast.props)
        return `${ast.tag}(${componentProps})`
      }
      // else is html element
      const elementProps = convertValuesWithRefsToStringLitterals(ast)
      return `\ncreateElement(${elementProps})`

    } catch (error) {
      console.error("Error processing JSX: ", match, error)
      return match; // fallback to original if error occurs
    }
  });

  return { element, imports }
}


function removeQuotesFromKeysAndValues(object: Object) {
  return JSON.stringify(object).replace(/:\s*"([^"]+)"/g, ': $1'); // Remove quotes 
}

function convertValuesWithRefsToStringLitterals(obj: Node) {
  // convert prop values to string litterals if needed, so we can pass variables or functions references
  return JSON.stringify(obj, null, 2)
    .replace(/("on[A-Z][a-zA-Z]*"):\s*"([^"]+)"/g, '$1: $2') // Keeps the key quoted but removes quotes from values
    .replace(/"([^"]*{[^"]*})"/g, (_, content) =>
      "`" + content.replace(/{/g, "${") + "`"
    );
}