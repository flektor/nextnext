import { Token, TokenType } from "./tokenizer";

export type Props = Record<string, string>;

export type ElementNode = {
  type: 'element'
  tag: string;
  props?: Props;
  children?: Node[];
}

export type TextNode = {
  type: 'text'
  value: string
}

export type ReactiveNode = {
  type: 'reactive'
  value: string
}

export type Node = ElementNode | ReactiveNode | TextNode



export function parseJsx(tokens: Token[], signals: string[]): ElementNode | undefined {
  // const parsedCode = reconstructCode(tokens)
  // console.log(jsx, tokens, parsedCode)
  // return parsedCode
  const stack: ElementNode[] = [];

  const addChild = (parent: ElementNode, child: Node) => {
    if (!parent) {
      return
    }

    if (parent.children) {
      parent.children.push(child);
    } else {
      parent.children = [child]
    }
  }

  function convertToStringLitteral(str: string) {
    return `\`${str.replace(/{([^{}]+)}/g, (_, expr) => `\${${expr}}`)}\``;
  }


  while (tokens.length > 0) {
    const token = tokens.pop();
    if (!token) continue;

    let node: Node | undefined;

    switch (token.type) {
      case TokenType.OPEN_TAG:
        stack.push({ tag: token.value, type: 'element' })
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
        addChild(stack[stack.length - 1], { type: 'text', value: token.value })
        break;

      case TokenType.REACTIVE_CONTENT:
        addChild(stack[stack.length - 1], {
          type: 'reactive',
          value: convertToStringLitteral(token.value)
        })
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