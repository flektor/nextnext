import { ComputedNode, ElementNode, Props, ReactiveNode, TextNode } from './parser/jsxParser';
import Vars from './variables';

export function createComponent(ast: ElementNode, children: any[]) {
    if (!ast.props) return `${ast.tag}()`;

    const props = ast.props ? removeQuotesFromKeysAndValues(ast.props) : '{}'
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
    const props = Object.entries(ast.props || {})
        .map(([key, value]) => {
            if (key === 'ref') {
                return `${value}.current = ${elementVarName}`
            } else if (key.startsWith("on")) {
                return `${elementVarName}.addEventListener("${key.slice(2).toLowerCase()}", ${value})`;
            } else if (key === "style") {
                return `Object.assign(${elementVarName}.style, ${JSON.stringify(value)})`;
            } else {
                return `${elementVarName}.setAttribute("${key}", ${value})`;
            }
        }).join("\n")

    if (children.length === 1) {
        return `(function() {
          const ${elementVarName} = document.createElement("${ast.tag}")
          ${props}
          appendContent(${elementVarName}, ${children})
          return ${elementVarName}
        })()`;
    }

    const hasChildren = children.length > 0
    const childrenVarName = Vars.children.next()

    return `(function() {

    ${hasChildren ? `const ${childrenVarName} = [${children}]` : ''}
      const ${elementVarName} = document.createElement("${ast.tag}")
      ${props}
      ${hasChildren ? `appendContent(${elementVarName}, ${childrenVarName})` : ''}
      return ${elementVarName};
    })()`;
}

export function createReactiveContent(ast: ReactiveNode) {
    const elementVarName = Vars.element.next()
    return `(function() {
      const ${elementVarName} = { current: getComputedContent(${ast.value}) }

     ${/*TODO: bind this ref to the prop ref, otherwise I assume that the props.ref will be lost after the effect runs*/ "// TODO@BuildTime"}

      effect(()=> defaultEffect(${elementVarName}, ${ast.value}))
      return ${elementVarName}.current
    })()`;
}

export function createTextContent(ast: TextNode): string {
    return `document.createTextNode('${ast.value}')`;
}

export function createComputedContent(ast: ComputedNode): string {
    return `getComputedContent(${ast.value})`
}

// function removeQuotesFromKeysAndValues(object: Object): Object | string {
//     if (Array.isArray(object)) {
//         return object.map((item) => {
//             if (typeof item === 'object' && item !== null) {
//                 return removeQuotesFromKeysAndValues(item);
//             }
//             return item;
//         });
//     }


//     return JSON.stringify(object).replace(/:\s*"([^"]+)"/g, ': $1'); // Remove quotes 
// } 

function removeQuotesFromKeysAndValues(object: Object): Object | string {
    const a = (
        '{' +
        Object.entries(object)
            .map(([key, value]) => {
                let valStr =
                    typeof value === 'string' && !/^["'].*["']$/.test(value)
                        ? value
                        : JSON.stringify(value);
                return `${key}: ${valStr}`;
            })
            .join(', ') +
        '}'
    )

console.error("TODO: here is where i left it, fix the nested text")
    return a
}
