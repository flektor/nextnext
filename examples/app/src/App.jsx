import { Home } from "./Home.jsx"
import { Tabs } from "./components/Tabs.jsx"

export function App() {

  const deephome = <p>
    <span class='text-red'>
      deep
    </span>
    <br></br>
    home
  </p>
  
  const about = <p>about</p>
  const documentation = <p>documentation</p>

  const contents = [Home(), deephome, about, documentation]
  const labels = ["home", "deephome", "about", "documentation",]

  const refTabs = createRef()


  return <Tabs ref={refTabs} labels={labels} contents={contents}></Tabs>
}


