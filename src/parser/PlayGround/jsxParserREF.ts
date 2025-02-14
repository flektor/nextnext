import { tokenize, TokenType } from "../tokenizer";

export type Attributes = Record<string, string>;

export type Node = {
  tag: string;
  attributes?: Attributes;
  children?: (string | Node)[];
};

export function parseJSX(jsx: string) {
  const tokens = tokenize(jsx).reverse();
  console.log(jsx)
  console.log(tokens)

  const stack: (string | Node)[] = [];

  const openTag = (tag: string) => {
    const node: Node = { tag, children: [] };
    stack.push(node);
  }

  const closeTag = () => {
    if (stack.length) return
    const node = stack.pop();
    if (!node) return

    let stringOrNode = stack[stack.length - 1];

    if (typeof stringOrNode === 'string') {
      stringOrNode = node
    } else {
      stringOrNode.children?.push(node);
    }
  }

  // For each element there is only one token for attributes.
  // Its value needs to be parsed in order to get each attribute
  // The logic could be moved on the tokenizer, but it will just add noise
  const addAttributes = (attrStr: string) => {
    const node = stack.pop()
    if (!node) return

    if (typeof node !== 'string') {
      const attributes = parseAttributes(attrStr)
      if (attributes) {
        node.attributes = attributes
      }
    }
    stack.push(node)
  }

  const addTextContent = (text: string) => {
    let stringOrNode = stack[stack.length - 1];

    if (typeof stringOrNode === 'string') {
      stringOrNode = text
    } else {
      stringOrNode.children?.push(text)
    }
  }

  while (tokens.length) {
    const token = tokens.pop();
    if (!token) continue;

    switch (token.type) {
      case TokenType.OPEN_TAG:
        openTag(token.value)
        break;

      case TokenType.CLOSE_TAG:
        closeTag()
        break;

      case TokenType.ATTRIBUTES:
        addAttributes(token.value)
        break;

      case TokenType.CONTENT:
        addTextContent(token.value)
        break;
    }
  }

  console.log(JSON.stringify(stack, null, 2))
  return stack[0] || null;
}


function parseAttributes(str: string) {
  if (!str) return false

  const regex = /(\w+)\s*=\s*{(.*?)}(?=\s|$)/g;
  const attributes: Attributes = {};
  let match;
  let hasAttributes = false;

  while ((match = regex.exec(str)) !== null) {
    const [, key, value] = match;
    attributes[key] = value.trim();
    hasAttributes = true;
  }

  if (hasAttributes) {
    return attributes
  }

  console.warn("TODO: FIX THIS")
  const [name, value] = str.split("=")
  const clearedValue = value.replace(/^\\?["'`]|\\?["'`]$/g, '');
  return { [name]: clearedValue || value }
}