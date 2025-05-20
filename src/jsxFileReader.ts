import path from 'path';
import fs from 'fs';
import { type Node } from './parser/jsxParser';
import { tokenize } from './parser/tokenizer';
import { parseJsx, Props, type ElementNode } from './parser/jsxParser';
import Vars from './variables';

export function importPage(filepath: string, root: string = ''): string {
  Vars.reset()

  return importComponent(filepath, root)
}

export function importComponent(filepath: string, root: string = ''): string {
  // If the filepath starts with ./ or ../, resolve it relative to the current file's directory.
  if (filepath.charAt(0) === '.' || filepath.charAt(0) === '/') {
    filepath = path.resolve(path.dirname(root), filepath);
  }

  // Read the content of the file.
  const code = fs.readFileSync(filepath, 'utf-8');
  // Assuming transformJsxToCreateElement is defined elsewhere
  let { element, imports: tempImports } = transformJsxToCreateElement(code);
  element = element.replace(/\bexport\b/g, '');
  let fileContent = element;

  // For each import, recursively resolve it using the current file's directory
  for (const imp of tempImports) {
    fileContent += '\n\n' + importComponent(imp.module, filepath);
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

const isComponentNode = (node: ElementNode) => !!node.tag.match(Regex.COMPONENT_TAG)

function createComponent(node: ElementNode) {
  if (!node.props) return `${node.tag}()`;

  const componentProps = removeQuotesFromKeysAndValues(node.props)

  return `${node.tag}(${componentProps})`
}


function transformASTToJS(ast: Node): string {
  if (ast.type === "text") {
    return `document.createTextNode(${JSON.stringify(ast.value)})`;
  }

  if (ast.type === "element") {
    const children = (ast.children || [])
      .map((child: any) => transformASTToJS(child))
    const hasChildren = children.length > 0

    // const effects = children.filter((childCode: any) => { console.log({ childCode }); return childCode.startsWith('\`') })
    //   .map((childCode: any) => `effect(()=> element.textContent = ${childCode});`).join("\n") || '';

    // children.map((childCode: any) => `element.appendChild(${childCode.trim()})`)
    //   .join("\n");

    const elementVarName = Vars.element.next()
    const childrenVarName = Vars.children.next()

    if (isComponentNode(ast)) {
      const props = ast.props ? convertValuesWithRefsToStringLitterals(ast.props, []) : '{}'

      if (children.length === 1) {
        return `(function() {
          const ${elementVarName} = ${ast.tag}(${props}) 
          ${elementVarName}.appendChild(${children})
          return ${elementVarName}
        })()`;
      }

      return `(function() {
        ${hasChildren ? `const ${childrenVarName} = [${children}]` : ''}
        const ${elementVarName} = ${ast.tag}(${props}) 
        ${hasChildren && !ast?.props?.children ? `${elementVarName}.append(...${childrenVarName})` : ''}
        return ${elementVarName};
      })()`;
    }

    const props = Object.entries(ast.props || {})
      .map(([key, value]) => {
        if (value === 'ref') {
          return `${value}.current = ${elementVarName}`
        } else if (key.startsWith("on")) {
          return `${elementVarName}.addEventListener("${key.slice(2).toLowerCase()}", ${value})`;
        } else if (key === "style") {
          return `Object.assign(${elementVarName}.style, ${JSON.stringify(value)})`;
        } else {
          return `${elementVarName}.setAttribute("${key}", ${JSON.stringify(value)})`;
        }
      }).join("\n");



    if (children.length === 1) {
      return `(function() {
        const ${elementVarName} = document.createElement("${ast.tag}")
        ${props}
        ${elementVarName}.appendChild(${children})
        return ${elementVarName}
      })()`;
    }

    return `(function() {
      ${hasChildren ? `const ${childrenVarName} = [${children}]` : ''}
      const ${elementVarName} = document.createElement("${ast.tag}")
      ${props}
      ${hasChildren ? `${elementVarName}.append(...${childrenVarName})` : ''}
      return ${elementVarName};
    })()`;
  }


  if (ast.type === "reactive") {
    // childCode.startsWith('\`')
    const elementVarName = Vars.element.next()
    return `(function() {
      const ${elementVarName} = document.createTextNode(${ast.value})
      effect(()=> ${elementVarName}.textContent = ${ast.value})
      return ${elementVarName}
    })()`;
  }

  if (ast.type === "computed") {
    return `document.createTextNode(${ast.value})`
  }

  return "";
}

function transformJsxToCreateElement(code: string) {
  const signals = extractSignals(code);
  const imports = findImports(code);

  code = code.replace(Regex.IMPORTS_MATCHER, '')

  const element = code.replace(Regex.JSX_MATCHER, match => {
    try {
      const tokens = tokenize(match, signals).reverse()
      if (tokens.length === 0) return '';

      const ast = parseJsx(tokens, signals)
      if (!ast) return '';
      return transformASTToJS(ast)

    } catch (error) {
      console.error("Error processing JSX: ", match, error)
      return match
    }
  });

  return { element, imports }
}

function removeQuotesFromKeysAndValues(object: Object) {
  return JSON.stringify(object).replace(/:\s*"([^"]+)"/g, ': $1'); // Remove quotes 
}

function convertValuesWithRefsToStringLitterals(obj: Props, signals: string[]) {
  // convert prop values to string litterals if needed, so we can pass variables or functions references
  return JSON.stringify(obj, null, 2)
    .replace(/("on[A-Z][a-zA-Z]*"):\s*"([^"]+)"/g, '$1: $2') // Keeps the key quoted but removes quotes from values
    .replace(/"([^"]*{[^"]*})"/g, (_, content) => {

      // for (const signal of signals) {
      //   if (content.includes(signal)) {
      //     content = (content as string).replace(new RegExp(`\\{([^}]*)\\b${signal}\\b([^}]*)\\}`, 'g'), (match, before, after) => {
      //       return `{${before}this.${signal}${after}}`;
      //     }).trim();
      //   }
      // }

      // console.log({ content })
      return "`" + content.replace(/{/g, "${") + "`"
    }
    );
}

// const signalRegex = /\bthis\.(\w+)\s*=\s*createSignal\(/g;

// const signalRegex = /\b(?:const|let|var)\s+(\w+)\s*=\s*createSignal\(/g;
const signalRegex = /const\s*\[([^,\]]+)(?:,\s*([^,\]]+))?\]\s*=\s*createSignal\(/g;

type SignalScope = {
  name: string;
  setter?: string;
  scopeLevel: number;
};

function extractSignals(code: string): string[] {
  const lines = code.split("\n")

  let scopeLevel = 0;
  const signals: SignalScope[] = [];

  for (const line of lines) {
    if (line.includes("{")) scopeLevel++;
    if (line.includes("}")) scopeLevel--;

    let match;
    while ((match = signalRegex.exec(line)) !== null) {
      const name = match[1].trim();
      const setter = match[2]?.trim();
      if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name)) {
        signals.push({ name, setter, scopeLevel })
      }
    }
  }

  return signals.map((s) => s.name)
}

// type Ref<T> = {
//   current: T | null
// }

