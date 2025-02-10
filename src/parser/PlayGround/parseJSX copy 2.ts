

type Token = { type: string; value?: string };
type Attributes = { [key: string]: string }
type Element = {
    tag: string;
    attributes?: Attributes;
    children?: any[];
    // children?: Element[] string | number | undefined | null;
    value?: string;
}
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
                tokens.push({ type: '>' });
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
                tokens.push({ type: '>' });
                continue;
            }

            if (value.substring(value.length - 2) === '>') {
                value = value.substring(0, value.length - 2)
                tokens.push({ type: 'attributes', value });
                tokens.push({ type: '>' });
                continue;
            }

            if (value[value.length - 1] === '>') {
                value = value.substring(0, value.length - 1)
                tokens.push({ type: 'attributes', value });

                // const type = value[value.length - 1] === '>'
                tokens.push({ type: '>' });
                continue;
            }

            const [text, children] = value.split('>').filter(t => t.trim())

            if (text && children) {
                tokens.push({ type: 'attributes', value: text });
                tokens.push({ type: 'children', value: children });
                continue;
            }


            if (text) {
                tokens.push({ type: 'children', value: text });
                tokens.push({ type: '>' });
                continue;
            }

            console.error("Syntax warning, not supported yet: " + value)
        }

        current++;
    }
    return tokens;
}

export function parseJSX(jsx: string) {
    console.log(jsx)

    const tokens = tokenize(jsx).reverse();
    console.log(tokens)

    const tree: Element = {
        tag: '<>',
        children: []
    }

    let currentElement: Element = tree;
    const history: Element[] = [];
    history.push(currentElement)
    let currentToken: Token | undefined;

    while (tokens.length > 0) {
        currentToken = tokens.pop()
        // console.log({ currentToken, currentElement: currentElement.tag })
        if (!currentToken) return

        // opening tag
        if (currentToken.type === '<') {
            if (!currentToken.value) {
                console.error("Syntax Error: Fragment <><> not supported yet")
                return
            }
            const newElement: Element = { tag: currentToken.value }
            if (!currentElement.children) (currentElement.children = []);
            currentElement.children.push(newElement)
            history.push(currentElement)
            currentElement = newElement
            continue
        }

        // self closing tag
        if (currentToken.type === '>' || currentToken.type === '>') {
            const prevElement = history[history.length - 1]
            if (prevElement) {
                history.push(currentElement)
                currentElement = prevElement
            }
            continue
        }

        if (currentToken.type === 'attributes') {
            if (!currentToken.value) {
                console.error("Syntax Error: Invalid Attribute")
                continue
            }

            const attributes = parseAttributes(currentToken.value)
            if (attributes) (currentElement.attributes = attributes);
            continue
        }

        if (currentToken.type === 'children') {
            if (!currentToken.value) {
                console.error("Syntax Error: Invalid Attribute")
                continue
            }

            if (!currentElement.children) (currentElement.children = []);
            currentElement.children.push(currentToken.value)
            continue
        }
    }

    console.log(JSON.stringify(tree, null, 2))

    return tree
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

    return hasAttributes && attributes
}

const headerScript = `
    const scripts = 
`;




function render(tree:Element) {

    let current: Element;
    let currentScript = '';
    if(tree.tag==='<>') {
        currentScript = `createElement('div')`
    }

    // tree.
}
