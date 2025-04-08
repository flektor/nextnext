import { Button } from "./Button.jsx"

export function Home({ isTrue }) {
  const [count, setCount] = createSignal(1)
  const [doubleCount, setDoubleCount] = createSignal(count() * 2)
  this.count = count
  this.setCount = setCount
  this.doubleCount = doubleCount
  console.log(this)

  effect(() => setDoubleCount(count() * 2))

  const onClick = () => setCount(count() + 1)

  const add = () => {

  }

  const something = () => "Something"

  const a = <ul id='111'>
    <li>first!</li>
    <li> 
      second {count()}
      <div>
        should support aageneric deep nesting
      </div>
    </li>
  </ul>


  const A = () => <ul id='111'>
    <li>first!</li>
    <li>
      second {count()}
      <div>
        should support generawdic deep nesting
      </div>
    </li>
  </ul>     

  if (isTrue) return <div>nothing</div>

  const one = 11

  const H1 = ({ className, children }) => <h2 class={className}>{children}</h2>
  const H2 = ({ children }) => <div >
    <h3>{children}</h3> 
  </div>

  const [className, setClassName] = createSignal("text-4xl")
  
  const [buttonColor, setButtonColor] = createSignal("bg-blue-500")

  return (<div class="flex justify-center"> 
    <p>
      {a}
      <H1 className={className()}>Home</H1>
      <br></br>

      <p>
        nested component construction delacration? ?
      </p>
      Something Else? {count()}
      <H2>Double count? {doubleCount()}</H2>
      <br></br>

      {count()} x {doubleCount()} = {count() * doubleCount()}
      <br></br>
      <p>
        <p>one: {one}</p>
        <p>wadw da {count()}</p>
      </p>
      <p class="flex gap-4"> 
        <button ref={ref} class="text-primary btn-cta btn-cta:hover" onClick={onClick}>
          Click me! {count()}
        </button>
        <Button color="red">awdaw</Button>
        <Button color="blue" label="Better Click Mee!" onClick={() => onClick('BOOMx10!!')}></Button>
      </p>
    </p>
  </div>)
}
