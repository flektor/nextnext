export type Token = { type: string; value: string };

export const TokenType = {
    OPEN_TAG: '<open>',
    CLOSE_TAG: '</close>',
    PROPS: 'props',
    CONTENT: 'content',
} as const

export function tokenize(jsx: string): Token[] {
    const tokens: Token[] = [];
    let current = 0;
    let currentTagElement: string | undefined;

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
                tokens.push({ type: TokenType.CLOSE_TAG, value: tagName });
                current++; // Skip '>'
                continue;
            }

            // Handle opening tag
            current++;
            let tagName = '';
            while (current < jsx.length && /[a-zA-Z0-9]/.test(jsx[current])) {
                tagName += jsx[current];
                current++;
            }
            tokens.push({ type: TokenType.OPEN_TAG, value: tagName });
            currentTagElement = tagName;
            continue;
        }


        // Match text children
        if (!/\S/.test(char)) {
            current++;
            continue
        }

        let value = '';
        while (current < jsx.length && jsx[current] !== '<') {
            value += jsx[current];
            current++;
        }

        value = value.replace('\n', '').trim()

        if (value[0] === '>') {
            value = value.substring(1)
        }

        if (value[value.length - 1] === '>') {
            if (value[value.length - 2] === '/') {
                value = value.substring(0, value.length - 2).trim()
                tokens.push({ type: TokenType.PROPS, value });
                tokens.push({ type: TokenType.CLOSE_TAG, value: currentTagElement as string });
                continue
            }
            value = value.substring(0, value.length - 1)
            tokens.push({ type: TokenType.PROPS, value });
            continue;
        }

        const [text, children] = value.trim().split('>')

        if (!text) { 
            continue;
        }

        if (text && children) {
            tokens.push({ type: TokenType.PROPS, value: text });
            tokens.push({ type: TokenType.CONTENT, value: children });
            continue;
        }

        if (text) {
            tokens.push({ type: TokenType.CONTENT, value: text });
            continue;
        }

        console.error("Syntax warning, not supported yet: ", { value })

    }
    return tokens;
}