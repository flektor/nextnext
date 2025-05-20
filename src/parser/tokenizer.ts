import { isReactive } from "./helpers";

export type Token = { type: string; value: string };

export const TokenType = {
    OPEN_TAG: '<open>',
    CLOSE_TAG: '</close>',
    PROPS: 'props',
    CONTENT: 'content',
    REACTIVE_CONTENT: 'reactive',
    COMPUTED_CONTENT: 'computed',
} as const


function convertToStringLitteral(str: string) {
    const newStr = str.replace(/{([^{}]+)}/g, (_, expr) => `\${${expr}}`)
    return newStr === str ? str : `\`${newStr}\``
}


export function tokenize(jsx: string, signals: string[] = []): Token[] {
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


            // todo     if current-1 === '/'   then prepare to close the tag    e.g <Button {...props} />




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
            // here text is the props as a string.  e.g 'ref={ref} class="bg-blue-500" onClick={onClick}'
            // children might be text


            tokens.push({ type: TokenType.PROPS, value: text })
            const hasEffect = signals && isReactive(children, signals)
            const type = hasEffect ? TokenType.REACTIVE_CONTENT : TokenType.CONTENT
            tokens.push({ type, value: children });
            continue;
        }

        if (text) {
            const hasEffect = signals && isReactive(text, signals)

            if (hasEffect) {
                tokens.push({ type: TokenType.REACTIVE_CONTENT, value: text });
                continue;
            }

            const newText = convertToStringLitteral(text)
            const isComputed = newText !== text

            if (isComputed) {
                tokens.push({ type: TokenType.COMPUTED_CONTENT, value: text });
                continue;
            }

            tokens.push({ type: TokenType.CONTENT, value: text });
            continue;
        }

        console.error("Syntax warning, not supported yet: ", { value })

    }

    return tokens;
}