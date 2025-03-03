import { Button } from "./Button.jsx"

export function Home({ isTrue }) {
  console.log({ isTrue })
  const onClick = () => console.log('boom!')
  const something = () => "Something"
  const tempIsTrue = Math.random() > .5
  const tempIsTrue2 = Math.random() > .2

  const a = <ul>
    <li>first</li>
    <li>
      second
      <div>
        should support generic deep nesting
      </div>
    </li>
  </ul>

  if (isTrue) return <div>nothing</div>

  const one = 1
  console.log('home!', one)

  return (<div class="flex justify-center bg-blue-500">
    <p>
      <h1>Home</h1>
      Something Else?
      <p>
        <p>one: {one}</p>
        <p>wadw da {something()}</p>
      </p>
      <button onClick={onClick}>Click me!</button>
      <Button label="Better Click Me!"></Button>
      <Button label="Better Click Mee!" />
    </p>
  </div>)
}


/*

TODO: Tackle Known Bugs

[ ] Support multiple div elements. Something is wrong with the root?
[ ] Support 


  <head>
    <link href="https://unpkg.com/tailwindcss@^1.2/dist/tailwind.min.css" rel="stylesheet">
  </head>
*/
