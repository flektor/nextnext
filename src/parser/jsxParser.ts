import { Token, TokenType } from "./tokenizer";

export type Props = Record<string, string>;

export type ElementNode = {
  type: 'element'
  tag: string;
  props?: Props;
  children?: Node[];
  childrenContext?: ChildrenContext
}

export type TextNode = {
  type: 'text'
  value: string
}

export type ComputedNode = {
  type: 'computed'
  value: Object
}

export type ReactiveNode = {
  type: 'reactive'
  value: string
}

export type Node = ElementNode | ComputedNode | ReactiveNode | TextNode
export type ChildrenContext = {
  id: number,
  value: string
} | undefined

export function parseJsx(tokens: Token[]): ElementNode | undefined {
  const stack: ElementNode[] = [];

  let contextCount = 0
  let context: ChildrenContext

  const addChild = (parent: ElementNode, child: Node) => {
    if (!parent) {
      return
    }

    if (parent.children) {
      parent.children.push(child);
    } else {
      parent.children = [child]
      if (context) {
        parent.childrenContext = context
      }
    }
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

      case TokenType.OPEN_CONTEXT:
        context = {
          id: contextCount++,
          value: token.value
        }
        break;

      case TokenType.CLOSE_CONTEXT:
        context = undefined
        break;

      case TokenType.CONTENT:
        addChild(stack[stack.length - 1], { type: 'text', value: token.value })
        break;

      case TokenType.REACTIVE_CONTENT:
        addChild(stack[stack.length - 1], {
          type: 'reactive',
          value: getReactiveValue(token.value)
        })
        break;

      case TokenType.COMPUTED_CONTENT:
        addChild(stack[stack.length - 1], {
          type: 'computed',
          value: getComputedValue(token.value)
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

function getComputedValue(str: string) {
  if (str.startsWith('{')) {
    return removeBrackets(str)
  }

  return convertToStringLitteral(str)
}

function getReactiveValue(str: string) {
  if (isSingleBracedExpression(str)) {
    return removeBrackets(str)
  }

  return convertToStringLitteral(str)
}

function isSingleBracedExpression(str: string) {
  return /^\{[^{}]+\}$/.test(str);
}

function removeBrackets(str: string) {
  return str.substring(1, str.length - 1)
}

function convertToStringLitteral(str: string) {
  return `\`${str.replace(/{([^{}]+)}/g, (_, expr) => `\${${expr}}`)}\``;
}

function parseProps(str: string) {
  const props: Record<string, string> = {};
  const regex = /(\w+)\s*=\s*(\{[^}]*\}|"(?:\\.|[^"])*"|'(?:\\.|[^'])*'|`(?:\\.|[^\\`]|(?:\${[^}]*}))*`)/g;
  let match;
  while ((match = regex.exec(str)) !== null) {
    const [, key, val] = match;
    props[key] = val.startsWith('{') ? val.slice(1, -1).trim() : val;

    if (props[key].startsWith("`")) {
      props[key] += "}`"
    }
  }

  return props;
}
