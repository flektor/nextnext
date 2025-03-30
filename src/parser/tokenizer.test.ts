import { describe, it, assertEqual } from '../tinyTest'
import { tokenize } from "./tokenizer"

describe("Testing the JSX tokenizer", () => {
 
  it("extracts the correct tokens from a simple jsx code", () => {

    const jsxCode = `
      <div class="container">
        <h1>Hello, World!</h1>
        <div class="bg-red-500">
          <div>
            <p>
              <h1> This is a <strong>nested</strong> example. </h1>
              <span style={{color: "red", bg: {calc()}}}>Deep nested</span>
            </p>
            <div class="bg-gray-500 flex gap-4">
              <h2> A few component variations! </h2>
              <ul>
                <li class="bg-gray-300"> 
                  <h3> Passing the text as custom prop </h3> 
                  <CustomButton class="bg-blue-500" onClick={onClick1} label="Click!"/>
                  <CustomButton onClick={onClick1} label={"Click!"}/>
                </li>
                <li class="bg-gray-400"> 
                  <h3> Passing the text as children prop </h3> 
                  <CustomButton onClick={onClick2} children={["Click!"]}/>
                </li>
                <li class="bg-gray-500 custom-size"> 
                  <h3> Passing the text as wrapped content </h3> 
                  <CustomButton class="bg-blue-500" onClick={onClick3}>     Click!  </CustomButton>
                </li>
              </ul>
          </div>
        </div>
      </div>`

    const expectedTokens = [
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
    ]

    const tokens = tokenize(jsxCode)
    assertEqual(tokens, expectedTokens)
  })
})
