import { Tabs } from "./Tabs.jsx"

export function MenuPage() {
  const deephome = <p>
    <span class='text-red'>
      deep
    </span>
    <br></br>
    home
    </p>
  const home = <span>home</span>
  const about = <p>about</p>
  const documentation = <p>documentation</p>

  const contents = [home,deephome, about, documentation]
  const labels = ["home", "deephome", "about", "documentation",]

  const refTabs = createRef()


  return <Tabs ref={refTabs} labels={labels} contents={contents}></Tabs>
}
