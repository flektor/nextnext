import path from 'path';
import fs from 'fs';
import { createElement, createComponent, createReactiveContent, createComputedContent, createTextContent } from './create';
import { parseJsx, type Node, type ElementNode } from './parser/jsxParser';
import { tokenize } from './parser/tokenizer';
import Vars from './variables';

export function importPage(filepath: string, root: string = ''): string {
  Vars.reset()

  return importComponent(filepath, root)
}

export function importComponent(filepath: string, root: string = ''): string {
  if (filepath.charAt(0) === '.' || filepath.charAt(0) === '/') {
    filepath = path.resolve(path.dirname(root), filepath);
  }

  const code = fs.readFileSync(filepath, 'utf-8');

  let { element, imports: tempImports } = transformJsxToElement(code);
  element = element.replace(/\bexport\b/g, '');
  let fileContent = '';

  for (const imp of tempImports) {
    fileContent += '\n\n' + importComponent(imp.module, filepath);
  }

  fileContent += '\n\n' + element

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

const isComponentNode = (ast: ElementNode) => !!ast.tag.match(Regex.COMPONENT_TAG)

function transformASTToJS(ast: Node, signals: string[]): string {
  if (ast.type === "text") {
    return createTextContent(ast);
  }

  if (ast.type === "element") {
    const children = (ast.children || [])
      .map((child: any) => transformASTToJS(child, signals))

    // const effects = children.filter((childCode: any) => { console.log({ childCode }); return childCode.startsWith('\`') })
    //   .map((childCode: any) => `effect(()=> element.textContent = ${childCode});`).join("\n") || '';

    // children.map((childCode: any) => `element.appendChild(${childCode.trim()})`)
    //   .join("\n");

    if (isComponentNode(ast)) {
      return createComponent(ast, children)
    }

    return createElement(ast, children, signals);
  }

  if (ast.type === "reactive") {
    return createReactiveContent(ast)
  }

  if (ast.type === "computed") {
    return createComputedContent(ast)
  }

  return "";
}

function transformJsxToElement(code: string) {
  const signals = extractSignals(code);
  const imports = findImports(code);

  code = code.replace(Regex.IMPORTS_MATCHER, '')

  const element = code.replace(Regex.JSX_MATCHER, match => {
    try {
      const tokens = tokenize(match, signals).reverse()
      if (tokens.length === 0) return '';

      const ast = parseJsx(tokens)
      if (!ast) return '';
      return transformASTToJS(ast, signals)

    } catch (error) {
      console.error("Error processing JSX: ", match, error)
      return match
    }
  });

  return { element, imports }
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

