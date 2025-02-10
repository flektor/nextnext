

import tinyTest from '../tinyTest'
import { tokenize } from './tokenizer';


// Example usage
const jsxCode = `<div class="container">
    <h1>Hello, World!</h1>
    <p>
      This is a <strong>nested</strong> example.
      <span style={{color: 'red', bg: {calc()}}}>Deep inside</span>
      <button onClick={onClick} onChange={onChange}>Click Me</button>
      <button onClick={onClick2} />

    </p>
  </div>`
tinyTest.describe('Testing the JSX tokenizer', () => {

    tinyTest.it('extracts the correct tokens from a simple jsx code', () => {

        const expectedTokens = [
            { type: '<open>', value: 'div' },
            { type: 'attributes', value: 'class="container"' },
            { type: '<open>', value: 'h1' },
            { type: 'children', value: 'Hello, World!' },
            { type: '</close>', value: 'h1' },
            { type: '<open>', value: 'p' },
            { type: 'children', value: '      This is a' },
            { type: '<open>', value: 'strong' },
            { type: 'children', value: 'nested' },
            { type: '</close>', value: 'strong' },
            { type: 'children', value: 'example.' },
            { type: '<open>', value: 'span' },
            { type: 'attributes', value: "style={{color: 'red', bg: {calc()}}}" },
            { type: 'children', value: 'Deep inside' },
            { type: '</close>', value: 'span' },
            { type: '<open>', value: 'button' },
            { type: 'attributes', value: 'onClick={onClick} onChange={onChange}' },
            { type: 'children', value: 'Click Me' },
            { type: '</close>', value: 'button' },
            { type: '<open>', value: 'button' },
            { type: 'attributes', value: 'onClick={onClick2}' },
            { type: '</close>', value: 'button' },
            { type: '</close>', value: 'p' },
            { type: '</close>', value: 'div' }
        ]

        const tokens = tokenize(jsxCode)
        tinyTest.assertEqual(tokens, expectedTokens)
    })
})
