import { Token, TokenType } from "./tokenizer";

export type Props = Record<string, string>;

export type Node = {
  tag: string;
  props?: Props;
  children?: (string | Node)[];
};

export function parseJsx(tokens: Token[]) : Node | undefined {
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

      case TokenType.PROPS:
        node = stack[stack.length - 1]
        if (node) {
          node.props = parseProps(token.value)
        }
    }
  }
}

function parseProps(str: string) {
  if (!str) return

  const regex = /(\w+)\s*=\s*{(.*?)}(?=\s|$)/g;
  const props: Props = {};
  let match;
  let hasProps = false;

  while ((match = regex.exec(str)) !== null) {
    const [, key, value] = match
    props[key] = value.trim()
    hasProps = true
  }

  if (hasProps) return props

  // console.warn("TODO: FIX THIS")
  const [name, value] = str.split("=")
  const clearedValue = value?.replace(/^\\?["'`]|\\?["'`]$/g, '')
  return { [name]: clearedValue || value }
} 