import express, { Request, Response } from 'express';
import { render } from './renderer';
import { parseJSX } from './parser/jsxParser';
import './parser/jsxParser.test';
import './parser/tokenizer.test';
import testSuite from './tinyTest'

const app = express();
const port = 3000;

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});


// const html = parseJSX('../../apps/pages/Home/Home.jsx')


// Example usage
const jsxCode = `<div class="container">
    <h1>Hello, World!</h1>
    <p>
      This is a <strong>nested</strong> example.
      <span style={{color: 'red', bg: {calc()}}}>Deep inside</span>
      <button onClick={onClick} onChange={onChange}>Click Me</button>
      <button onClick={onClick2} />

    </p>
  </div>`;


const parsedJSX = parseJSX(jsxCode)

// renderElement(parsedJSX)

// testSuite.run();

// console.log(html)

// render();

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
