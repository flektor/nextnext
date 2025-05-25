import { Button } from "./components/Button.jsx"

export function Home({ isTrue }) {
  const [count, setCount] = createSignal(1)
  const [doubleCount, setDoubleCount] = createSignal(count() * 2)

  effect(() => setDoubleCount(count() * 2))

  const onClick = () => setCount(count() + 1)

  const one = 11

  const onClick2 = () => console.log('Boom2!')

  const ref = createRef()
  const refDiv = createRef()
  console.log(ref)

  
  return (<div ref={refDiv} class="flex justify-center">
    <p>
      <p>
        nested component construction delacration? ?
      </p>
      Something Else? {count()}
      <br></br>

      <span>{one}</span>

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
        <Button color="red" onClick={onClick2} label="style 2"></Button>
      </p>
    </p>
  </div>)
}
