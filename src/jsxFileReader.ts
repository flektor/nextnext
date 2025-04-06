import path, { normalize } from 'path';
import fs from 'fs';
import { Token, tokenize } from "./parser/tokenizer";
import { parseJsx, Props, type ElementNode } from './parser/jsxParser';

const logger = (enabled = true) => ({
  log: (...params: any[]) => enabled && console.log(...params)
})

const { log } = logger(false)

export function importComponent(filepath: string, root: string = '') {
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
  if (!node.props) return `new ${node.tag}()`;

  const componentProps = removeQuotesFromKeysAndValues(node.props)

  return `new ${node.tag}(${componentProps})`
}

function createElement(node: ElementNode, refs: Ref[], signals: any) {
  if (isComponentNode(node)) {
    return createComponent(node)
  }

  // else is html element

  const elementProps = convertValuesWithRefsToStringLitterals(node, signals)

  if (!node.children) {

    // console.log({ refs, effects: node.effects })
    let output = `\ncreateElement(${elementProps}, this`
    output += `, ${refs ? JSON.stringify(refs) : 'null'}`
    output += ', null'
    // console.log({ output })
    return output + ')'
  }

  for (let child of node.children) {
    if (child.type === 'text' || child.type === 'reactive') continue


    if (isComponentNode(node)) {
      child = { type: 'text', value: createComponent(node) }
      continue
    }

    if (child.type === 'element') {
      for (let grandchild of child.children ?? []) {
        if (grandchild.type !== "element") continue;

        grandchild.children?.forEach(grandchild => {

          if (grandchild.type == "element") {
            const grandChildElement = createElement(grandchild, refs, signals)
            if (grandChildElement) {
              grandchild = { type: 'text', value: grandChildElement }
            }
          }
        })
      }
    }
  }

  let output = `\ncreateElement(${elementProps}, this`
  output += `, ${refs ? JSON.stringify(refs) : 'null'}, null`
  return output + ', effect)'
}

function transformJsxToCreateElement(code: string) {
  const imports = findImports(code)

  const { signals, refs } = extractSignalsAndRefs(code);
  // console.log("Extracted signals:", signals);
  // console.log("Extracted refs:", refs);

  code = code.replace(Regex.IMPORTS_MATCHER, '')

  // console.log(code)


  //   code = code.replace(Regex.IMPORTS_MATCHER,match => {
  //   console.log(match)
  //   match.replace
  //   return ''
  // })

  const element = code.replace(Regex.JSX_MATCHER, match => {
    try {
      const tokens = tokenize(match, signals).reverse()
      // console.log(tokens)
      if (tokens.length === 0) return '';

      const ast = parseJsx(tokens, signals)
      if (!ast) return '';
      return createElement(ast, refs as any, signals)

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

function convertValuesWithRefsToStringLitterals(obj: ElementNode, signals: string[]) {
  // convert prop values to string litterals if needed, so we can pass variables or functions references
  return JSON.stringify(obj, null, 2)
    .replace(/("on[A-Z][a-zA-Z]*"):\s*"([^"]+)"/g, '$1: $2') // Keeps the key quoted but removes quotes from values
    .replace(/"([^"]*{[^"]*})"/g, (_, content) => {

      for (const signal of signals) {
        if (content.includes(signal)) {
          content = (content as string).replace(new RegExp(`\\{([^}]*)\\b${signal}\\b([^}]*)\\}`, 'g'), (match, before, after) => {
            return `{${before}this.${signal}${after}}`;
          }).trim();
        }
      }

      // console.log({ content })
      return "`" + content.replace(/{/g, "${") + "`"
    }
    );
}

// const signalRegex = /\bthis\.(\w+)\s*=\s*createSignal\(/g;

// const signalRegex = /\b(?:const|let|var)\s+(\w+)\s*=\s*createSignal\(/g;
const signalRegex = /const\s*\[([^,\]]+)(?:,\s*([^,\]]+))?\]\s*=\s*createSignal\(/g;
const refRegex = /const\s+(\w+)\s*=\s*createRef\(/g;
const jsxExpressionRegex = /\{([^}]+)\}/g;

type SignalScope = {
  name: string;
  setter?: string;
  scopeLevel: number;
};

type RefScope = {
  name: string;
  scopeLevel: number;
};

function extractSignalsAndRefs(code: string): { signals: string[]; refs: string[]; usages: string[] } {
  const lines = code.split("\n");

  let scopeLevel = 0;
  const signals: SignalScope[] = [];
  const refs: RefScope[] = [];
  const usages: string[] = [];

  for (const line of lines) {
    if (line.includes("{")) scopeLevel++;
    if (line.includes("}")) scopeLevel--;

    let match;
    while ((match = signalRegex.exec(line)) !== null) {
      const name = match[1].trim();
      const setter = match[2]?.trim();
      if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name)) {
        signals.push({ name, setter, scopeLevel });
      }
    }

    while ((match = refRegex.exec(line)) !== null) {
      const name = match[1].trim();
      if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name)) {
        refs.push({ name, scopeLevel });
      }
    }

    while ((match = jsxExpressionRegex.exec(line)) !== null) {
      const expression = match[1].trim();
      signals.forEach((signal) => {
        const regex = new RegExp(`\\b${signal.name}\\s*\\(\\s*\\)`, "g"); // Match function calls only
        if (regex.test(expression)) {
          usages.push(signal.name);
        }
      });
    }
  }

  return {
    signals: signals.map((s) => s.name),
    refs: refs.map((r) => r.name),
    usages: [...new Set(usages)] // Ensure unique matches
  };
}


type Ref = {
  current: null
}


// type Ref<T> = {
//   current: T | null
// }


// function attachRef<T extends HTMLElement>(ref: Ref<HTMLElement>, element: T) {
//   ref.current = element
// }