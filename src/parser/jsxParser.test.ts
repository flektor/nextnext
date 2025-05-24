
import { describe, it, assertEqual } from '../tinyTest'
import { parseJsx } from './jsxParser'

describe('Testing the JSX Parser', () => {

    it('generates a simple AST from token stack', () => {

        const tokens = [
            { type: "<open>", value: "div" },
            { type: "props", value: "class=\"container\"" },
            { type: "<open>", value: "h1" },
            { type: "content", value: "Hello, World!" },
            { type: "</close>", value: "h1" },
            { type: "<open>", value: "div" },
            { type: "props", value: "class=\"bg-red-500\"" },
            { type: "<open>", value: "div" },
            { type: "<open>", value: "p" },
            { type: "<open>", value: "h1" },
            { type: "content", value: "This is a" },
            { type: "<open>", value: "strong" },
            { type: "content", value: "nested" },
            { type: "</close>", value: "strong" },
            { type: "content", value: "example." },
            { type: "</close>", value: "h1" },
            { type: "<open>", value: "span" },
            { type: "props", value: "style={{color: \"red\", bg: {calc()}}}" },
            { type: "content", value: "Deep nested" },
            { type: "</close>", value: "span" },
            { type: "</close>", value: "p" },
            { type: "<open>", value: "div" },
            { type: "props", value: "class=\"bg-gray-500 flex gap-4\"" },
            { type: "<open>", value: "h2" },
            { type: "content", value: "A few component variations!" },
            { type: "</close>", value: "h2" },
            { type: "<open>", value: "ul" },
            { type: "<open>", value: "li" },
            { type: "props", value: "class=\"bg-gray-300\"" },
            { type: "<open>", value: "h3" },
            { type: "content", value: "Passing the text as custom prop" },
            { type: "</close>", value: "h3" },
            { type: "<open>", value: "CustomButton" },
            { type: "props", value: "class=\"bg-blue-500\" onClick={onClick1} label=\"Click!\"" },
            { type: "</close>", value: "CustomButton" },
            { type: "<open>", value: "CustomButton" },
            { type: "props", value: "onClick={onClick1} label={\"Click!\"}" },
            { type: "</close>", value: "CustomButton" },
            { type: "</close>", value: "li" },
            { type: "<open>", value: "li" },
            { type: "props", value: "class=\"bg-gray-400\"" },
            { type: "<open>", value: "h3" },
            { type: "content", value: "Passing the text as children prop" },
            { type: "</close>", value: "h3" },
            { type: "<open>", value: "CustomButton" },
            { type: "props", value: "onClick={onClick2} children={[\"Click!\"]}" },
            { type: "</close>", value: "CustomButton" },
            { type: "</close>", value: "li" },
            { type: "<open>", value: "li" },
            { type: "props", value: "class=\"bg-gray-500 custom-size\"" },
            { type: "<open>", value: "h3" },
            { type: "content", value: "Passing the text as wrapped content" },
            { type: "</close>", value: "h3" },
            { type: "<open>", value: "CustomButton" },
            { type: "props", value: "class=\"bg-blue-500\" onClick={onClick3}" },
            { type: "content", value: "     Click!" },
            { type: "</close>", value: "CustomButton" },
            { type: "</close>", value: "li" },
            { type: "</close>", value: "ul" },
            { type: "</close>", value: "div" },
            { type: "</close>", value: "div" },
            { type: "</close>", value: "div" }
        ].reverse()

        const expectedOutput = {
            tag: "root",
            children: [{
                tag: "div",
                children: [{
                    tag: "h1",
                    children: [
                        { tag: "p" },
                        { tag: "strong", children: ["example."] },
                        {
                            tag: "span",
                            props: { style: { color: 'red' }, children: ["Deep nested"] },
                        },
                        {
                            tag: "button",
                            props: { onClick: "onClick", onChange: "onChange" },
                            children: ["Click Me"]
                        },
                        { tag: "button", props: { onClick: "onClick2" } }
                    ]
                }]
            }]
        } 
        
        const parsedJSX = parseJsx(tokens, [])
        assertEqual(expectedOutput, parsedJSX)
    })
})