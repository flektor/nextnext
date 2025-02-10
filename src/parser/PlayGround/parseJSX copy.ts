

type Token = { type: string; value?: string };

type Element = {
    type: string;
    tag?: string;
    attributes?: Record<string, string>;
    children?: Element[];
    value?: string;
}

// type AST = {
//     type: 'root';
//     children: Element[];
// }

// type Node = AST | Element;

function tokenize(jsx: string): Token[] {
    const tokens: Token[] = [];
    let current = 0;

    while (current < jsx.length) {
        let char = jsx[current];

        // Match opening tag
        if (char === '<') {
            // Check if it's a closing tag
            if (jsx[current + 1] === '/') {
                current += 2; // Skip '</'
                let tagName = '';
                while (current < jsx.length && /[a-zA-Z0-9]/.test(jsx[current])) {
                    tagName += jsx[current];
                    current++;
                }
                tokens.push({ type: '>', value: tagName });
                current++; // Skip '>'
                continue;
            }

            // Handle self-closing tag
            if (jsx[jsx.length - 1] === '/') {
                tokens.push({ type: '/>' });
                current++;
                continue;
            }

            // Handle opening tag
            current++;
            let tagName = '';
            while (current < jsx.length && /[a-zA-Z0-9]/.test(jsx[current])) {
                tagName += jsx[current];
                current++;
            }

            tokens.push({ type: '<', value: tagName });
            continue;
        }


        // Match text children
        if (/\S/.test(char)) {
            let value = '';
            while (current < jsx.length && jsx[current] !== '<') {
                value += jsx[current];
                current++;
            }

            value = value.replace('\n', '').trim()
            if (value[0] === '>') {
                value = value.substring(1)
                tokens.push({ type: '/>' });
                continue;
            }

            if (value.substring(value.length - 2) === '/>') {
                value = value.substring(0, value.length - 2)
                tokens.push({ type: 'attributes', value });
                tokens.push({ type: '/>' });
                continue;
            }

            if (value[value.length - 1] === '>') {
                value = value.substring(0, value.length - 1)
                tokens.push({ type: 'attributes', value });
                tokens.push({ type: '>' });
                continue;
            }

            const [text, children] = value.split('>').filter(t => t.trim())

            console.log({ text, children })

            if (text && children) {
                tokens.push({ type: 'attributes', value: text });
                tokens.push({ type: 'children', value: children });
                continue;
            }


            if (text) {
                tokens.push({ type: 'children', value: text });
                tokens.push({ type: '/>' });
                continue;
            }

            console.error("Syntax warning, not supported yet: " + value)
        }

        current++;
    }
console.log(current)
    return tokens;
}

// function parse(tokens: Token[]): AST {
//     let current = 0;

//     function walk(): Node {
//         let token = tokens[current];

//         if (token.type === '<') {
//             const node: Node = {
//                 type: 'element',
//                 tag: token.value,
//                 attributes: {},
//                 children: [],
//             };

//             current++;

//             // Parse attributes
//             while (current < tokens.length && tokens[current].type === 'text' && tokens[current].value) {
//                 const attrMatch = tokens[current].value?.match(/(\w+)="([^"]*)"/);
//                 if (attrMatch) {
//                     const [_, name, value] = attrMatch;
//                     node.attributes![name] = value;
//                 }
//                 current++;
//             }

//             // Parse children
//             while (node.children && current < tokens.length && tokens[current].type !== '>') {
//                 node.children.push(walk());
//             }

//             // Skip the closing tag
//             if (current < tokens.length && tokens[current].type === '>') {
//                 current++;
//             }

//             return node;
//         }
//         current++;

//         return token
//         // // return token
//         // // console.log(token)
//         // if (token.type === 'children') {
//         //     current++;
//         //     console.log({ token })
//         //     return {
//         //         type: 'children',
//         //         value: token.value,
//         //     };
//         // }

//         // if (token.type === 'attributes') {
//         //     current++;
//         //     console.log({ token })
//         //     return {
//         //         type: 'attributes',
//         //         value: token.value,
//         //     };
//         // }

//         console.log(token)
//         throw new TypeError(`Unknown token: ${token.type}`);
//     }

//     const ast = {
//         nodeType: 'AST',
//         type: 'root',
//         children: [] as Element[],
//     } as const;

//     while (current < tokens.length) {
//         ast.children.push(walk());
//     }

//     return ast;
// }

// function generate(node: Node): string {
//     if (node.type === 'root') {
//         return node.children?.map(child => generate(child)).join('') || '';
//     }

//     if (node.type === 'element' && node.attributes) {
//         // console.log(node.attributes)
//         // console.log(node.children?.filter(({ type }) => type === 'attributes').map(({ value }) => value))
//         const attributes = Object.entries(node.attributes)
//             .map(([key, value]) => `${key}="${value}"`)
//             .join(' ');
//         const children = node.children?.map(child => generate(child)).join('');
//         return `<${node.tag} ${attributes}>${children}</${node.tag}>`;
//     }

//     if (node.type === 'children') {
//         return node.value || '';
//     }

//     if (node.type === 'attributes') {
//         return node.value || '';
//     }

    
//     if (node.type === '/>') {
//         return node.value || '';
//     }

//     console.error('Error Message: Type not supported: ' + node.type, { node })
//     throw new Error('Type not supported ' + (JSON.stringify(node)));
// }

// export function parseJSX(jsx: string) {
//     const tokens = tokenize(jsx).reverse();
//     console.log(jsxCode, tokens)

//     const tree = {}

//     let current;
//     let next = tokens[tokens.length-1]
//     const isNextTokenClosingTagType = ()=> next.type && next.type=== '>' || 
    
//     while (tokens.length > 0) {
//         current = tokens.pop()

//         if(!current) {
//             return 
//         }

//         // self closing tag
//         if(current.type === '/>'){
             
//         }

//         // closing tag
//         if(current.type === '>'){

//         }
        
        
//       current = 
//     }






//     // const ast = parse(tokens);
//     // console.log({ast:ast.children[2]})
// return tokens
//     // return generate(ast);
// }

// Example usage
const jsxCode = `<div class="container">
    <h1>Hello, World!</h1>
    <p>
      This is a <strong>nested</strong> example.
      <span style={{color: 'red'}}>Deep inside</span>
      <button onClick={onClick} onChange={onChange}>Click Me</button>
      <button onClick={onClick2} />

    </p>
  </div>`;
