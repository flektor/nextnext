
import tinyTest from '../tinyTest'
import { parseJSX } from './jsxParser';

tinyTest.describe('Testing the JSX Parser', () => {

    tinyTest.it('generates the element tree for a single jsx code', () => {

        const jsxCode = `<div class="container">
        <h1>Hello, World!</h1>
        <p>
          This is a <strong>nested</strong> example.
          <span style={{color: 'red', bg: {calc()}}}>Deep inside</span>
          <button onClick={onClick} onChange={onChange}>Click Me</button>
          <button onClick={onClick2} />
    
        </p>
      </div>`

        const expectedOutput = {
            tag: "root",
            children: [
                {
                    tag: "div",
                    children: [

                    ]
                },
                {
                    tag: "h1",
                    children: [
                        {
                            tag: "p"
                        },
                        {
                            tag: "strong",
                            children: ["example."]
                        },
                        {
                            tag: "span",
                            attributes: {
                                style: "{color: 'red}'"
                            },
                            children: [
                                "Deep inside"
                            ]
                        },
                        {
                            tag: "button",
                            attributes: {
                                onClick: "onClick",
                                onChange: "onChange"
                            },
                            children: [
                                "Click Me"
                            ]
                        },
                        {
                            tag: "button",
                            attributes: {
                                onClick: "onClick2"
                            }
                        }
                    ]
                }
            ]
        }

        const parsedJSX = parseJSX(jsxCode)
        tinyTest.assertEqual(parsedJSX, expectedOutput)
    })
})