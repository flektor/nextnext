import { Button } from "./Button.jsx"

export function Home({ isTrue }) {
  this.self = this
  console.log(this)
  this.count = createSignal(0)
  const setCount = this.count[1]
  this.t = 'what'
  // const [doubleCount] = createSignal(this.count.count.count() * 2)
  // this.setCount(2)


  const onClick = ()=> {
    setCount(this.count[0]() + 1)
  }

  const something = () => "Something"

  const a = <ul>
    <li>first!</li>
    <li>
      second
      <div>
        should support generic deep nesting
      </div>
    </li>
  </ul>

  if (isTrue) return <div>nothing</div>

  const one = 1

  return (<div class="flex justify-center">
    <p>
      <h1 class="text-4xl">Home</h1>
      Something Else? {count[0]()}
      <p>
        <p>one: {one}</p>
        <p>wadw da {something}</p>
      </p>
      <p class="flex gap-4">
        <button ref={ref} class="bg-blue-500" onClick={onClick}>
          Click me! {count[0]()}
        </button>
        <Button color="red">awdaw</Button>
        <Button color="blue" label="Better Click Mee!" onClick={() => onClick('BOOMx10!!')}></Button>
      </p>
    </p>
  </div>)
}
