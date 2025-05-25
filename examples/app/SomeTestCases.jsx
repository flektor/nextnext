function SomeTestingScenarios() {
  const a = <span id='111'> should support components as variables </span>

  const aa = 'test works'

  const jsxCases = [
    {
      it: "case 1",
      jsx: <div> {a} </div>,
    },
    {
      it: "case 2",
      jsx: <div> {a} something </div>,
    },
    {
      it: "case 3",
      jsx: <div> something {a} </div>,
    },
    {
      it: "case 4",
      jsx: <div>
        {a}
        {a}
      </div>,
    },
    {
      it: "case 5",
      jsx: <div>
        {a}
        {a} something
      </div>,
    },
    {
      it: "case 6",
      jsx: <div>
        {a}
        <br></br>
        {a} something
      </div>,
    },
    {
      it: "case 7",
      jsx: <div> {() => "something"} </div>,
    },
    {
      it: "case 8",
      jsx: <div>
        {() => {
          const one = 1
          return <span>{one}</span>
        }}
      </div>,
    },
  ]
}
