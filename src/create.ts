import { ComputedNode, ElementNode, Props, ReactiveNode, TextNode, type Node } from './parser/jsxParser';
import Vars from './variables';

export function createComponent(ast: ElementNode, children: any[]) {
    if (!ast.props) return `${ast.tag}()`;

    const props = ast.props ? removeQuotesFromKeysAndValues(ast.props) : '{}'
    console.log({ props })
    // const componentProps = removeQuotesFromKeysAndValues(ast.props)
    const elementVarName = Vars.element.next()
    const childrenVarName = Vars.children.next()

    if (children.length === 1) {
        return `(function() {
          const ${elementVarName} = ${ast.tag}(${props}) 
          ${elementVarName}.appendChild(${children})
          return ${elementVarName}
        })()`;
    }
    const hasChildren = children.length > 0

    return `(function() {
        ${hasChildren ? `const ${childrenVarName} = [${children}]` : ''}
        const ${elementVarName} = ${ast.tag}(${props}) 
        ${hasChildren && !ast?.props?.children ? `${elementVarName}.append(...${childrenVarName})` : ''}
        return ${elementVarName};
      })()`;
}

export function createElement(ast: ElementNode, children: any[]) {
    const elementVarName = Vars.element.next()
    const childrenVarName = Vars.children.next()
    const props = Object.entries(ast.props || {})
        .map(([key, value]) => {
            if (value === 'ref') {
                return `${value}.current = ${elementVarName}\n`
            } else if (key.startsWith("on")) {
                return `${elementVarName}.addEventListener("${key.slice(2).toLowerCase()}", ${value})\n`;
            } else if (key === "style") {
                return `Object.assign(${elementVarName}.style, ${JSON.stringify(value)})\n`;
            } else {
                return `${elementVarName}.setAttribute("${key}", ${JSON.stringify(value)})\n`;
            }
        })

    if (children.length === 1) {
        return `(function() {
        const ${elementVarName} = document.createElement("${ast.tag}")
        ${props}
        ${elementVarName}.appendChild(${children})
        return ${elementVarName}
      })()`;
    }

    const hasChildren = children.length > 0

    return `(function() {
      ${hasChildren ? `const ${childrenVarName} = [${children}]` : ''}
      const ${elementVarName} = document.createElement("${ast.tag}")
      ${props}
      ${hasChildren ? `${elementVarName}.append(...${childrenVarName})` : ''}
      return ${elementVarName};
    })()`;
}

export function createReactiveContent(ast: ReactiveNode) {
    // childCode.startsWith('\`')
    const elementVarName = Vars.element.next()
    return `(function() {
      const ${elementVarName} = document.createTextNode(${ast.value})
      effect(()=> ${elementVarName}.textContent = ${ast.value})
      return ${elementVarName}
    })()`;
}

export function createTextContent(ast: TextNode): string {
    return `document.createTextNode(${JSON.stringify(ast.value)})`;
}

export function createComputedContent(ast: ComputedNode): string {
    return `document.createTextNode(${ast.value})`
}


function removeQuotesFromKeysAndValues(object: Object): Object | string {
    if (Array.isArray(object)) {
        return object.map((item) => {
            if (typeof item === 'object' && item !== null) {
                console.log({ item })
                return removeQuotesFromKeysAndValues(item);
            }
            return item;
        });
    }
    console.log({ object })

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