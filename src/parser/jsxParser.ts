import { tokenize, Tags, type Token } from "./tokenizer";

type Attributes = { [key: string]: string }

type Node = {
  tag: string;
  attributes?: Attributes;
  children?: (string | Node)[];
};

export function parseJSX(jsx: string) {
  const tokens = tokenize(jsx).reverse();
  console.log(jsx)
  console.log(tokens)

  const stack: (string | Node)[] = [];

  while (tokens.length) {
    const token = tokens.pop();
    if (!token) continue;

    if (token.type === '<open>') {
      // Create a new node
      const node: Node = { tag: token.value, children: [] };
      stack.push(node);
      continue
    } 
    
    if (token.type === '</close>') {
      // When encountering a close tag, pop the stack to get the completed node
      if (stack.length ===0) {
        const node = stack.pop();
        if (node) {
          let stringOrNode = stack[stack.length - 1];
          if (typeof stringOrNode === 'string') {
            stringOrNode = node
          } else {
            stringOrNode.children?.push(node);
          }
        }
      }
      continue
    }
    
    if (token.type === 'attributes') {
      const node = stack.pop()
      if (node && typeof node !== 'string') {
        const attributes = parseAttributes(token.value)
        if (attributes) {
          node.attributes = attributes
        }
      }
      if (node) {
        stack.push(node)
      }
      continue
    }
    
    if (token.type === 'children' && stack.length) {
      let stringOrNode = stack[stack.length - 1];
      if (typeof stringOrNode === 'string') {
        stringOrNode = token.value;
      } else {
        stringOrNode.children?.push(token.value)
      }
    }
  }

  console.log(JSON.stringify(stack, null, 2))
  return stack[0] || null;
}


function parseAttributes(str: string) {
  const regex = /(\w+)\s*=\s*{(.*?)}(?=\s|$)/g;

  const attributes: Attributes = {};
  let match;
  let hasAttributes = false;
  while ((match = regex.exec(str)) !== null) {
    const [, key, value] = match;
    attributes[key] = value.trim();
    hasAttributes = true;
  }

  if (str && !hasAttributes) {
    console.warn("TODO: FIX THIS")
    const [name, value] = str.split("=")
    const clearedValue = value.replace(/^\\?["'`]|\\?["'`]$/g, '');
    return { [name]: clearedValue || value }
  }

  return hasAttributes && attributes
}