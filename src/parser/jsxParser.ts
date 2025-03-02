import { Token, TokenType } from "./tokenizer";

export type Attributes = Record<string, string>;

export type Node = {
  tag: string;
  attributes?: Attributes;
  children?: (string | Node)[];
};

export function parseJSX(tokens: Token[]) {
  // const parsedCode = reconstructCode(tokens)
  // console.log(jsx, tokens, parsedCode)
  // return parsedCode
  const stack: Node[] = [];

  const addChild = (parent: Node, child: Node | string) => {
    if (!parent) {
      return
    }

    if (parent.children) {
      parent.children.push(child);
    } else {
      parent.children = [child]
    }
  }

  while (tokens.length > 0) {
    const token = tokens.pop();
    if (!token) continue;

    let node: string | Node | undefined;

    switch (token.type) {
      case TokenType.OPEN_TAG:
        stack.push({ tag: token.value })
        break;

      case TokenType.CLOSE_TAG:
        node = stack.pop();

        if (stack.length === 0) {
          return node // the root element
        }

        if (node) {
          addChild(stack[stack.length - 1], node)
        }
        break;

      case TokenType.CONTENT:
        addChild(stack[stack.length - 1], token.value)
        break;

      case TokenType.ATTRIBUTES:
        node = stack[stack.length - 1]
        if (node) {
          node.attributes = parseAttributes(token.value)
        }
    }
  }
}

function parseAttributes(str: string) {
  if (!str) return

  const regex = /(\w+)\s*=\s*{(.*?)}(?=\s|$)/g;
  const attributes: Attributes = {};
  let match;
  let hasAttributes = false;

  while ((match = regex.exec(str)) !== null) {
    const [, key, value] = match
    attributes[key] = value.trim()
    hasAttributes = true
  }

  if (hasAttributes) return attributes

  // console.warn("TODO: FIX THIS")
  const [name, value] = str.split("=")
  const clearedValue = value?.replace(/^\\?["'`]|\\?["'`]$/g, '')
  return { [name]: clearedValue || value }
} 