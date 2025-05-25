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

export type ComputedNode = {
  type: 'computed'
  value: Object
}

export type ReactiveNode = {
  type: 'reactive'
  value: string
}

export type Node = ElementNode | ComputedNode | ReactiveNode | TextNode

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

          value: isSingleFunctionExpression(token.value) ? token.value.substring(1, token.value.length - 1) : convertToStringLitteral(token.value)
        })
        break;

      case TokenType.COMPUTED_CONTENT:
        const value = token.value.startsWith('{') ? token.value.substring(1, token.value.length - 1) : convertToStringLitteral(token.value)
        addChild(stack[stack.length - 1], {
          type: 'computed',
          // value: convertToStringLitteral(token.value)
          value
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
function isSingleFunctionExpression(str: string): boolean {
  return /^\s*\{[a-zA-Z_$][\w$]*\(\)\}\s*$/.test(str);
}

function parseProps(str: string) {
  const props: Record<string, string> = {};
  const regex = /(\w+)\s*=\s*(\{[^}]*\}|"(?:\\.|[^"])*"|'(?:\\.|[^'])*'|`(?:\\.|[^\\`]|(?:\${[^}]*}))*`)/g;
  let match;
  while ((match = regex.exec(str)) !== null) {
    const [, key, val] = match;
    props[key] = val.startsWith('{') ? val.slice(1, -1).trim() : val;
  
    if(props[key].startsWith("`")) {
      props[key] += "}`"
    }
  }

  // console.log({str,props})
  
  return props;
}

// function parseProps(str: string, signals: string[]) {
//   if (!str) return

//   const regex = /(\w+)\s*=\s*{(.*?)}(?=\s|$)/g;
//   const props: Props = {};
//   let match;

//   while ((match = regex.exec(str)) !== null) {
//     const [, key, value] = match
//     props[key] = value.trim()
//   } 
//   // if (Object.keys(props).length) return props

//   console.log(str.split("\n"))


//   const [name, value] = str.split("=")
//   const clearedValue = value?.replace('\r' ,'').trim().replace(/^\\?["'`]|\\?["'`]$/g, '')
//   const propss = { [name]: clearedValue || value }

//   console.log({str, propss})
//   return {...propss, ...props}

// } 