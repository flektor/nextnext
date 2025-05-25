import { Tabs } from "./Tabs.jsx"
import { describe, it, assert } from '../../../../../app/tinyTest.js'

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

    const contents = [home, deephome, about, documentation]
    const labels = ["home", "deephome", "about", "documentation",]

    const refTabs = createRef()


    return <Tabs ref={refTabs} labels={labels} contents={contents}></Tabs>
}

console.log('eeeee')

describe("Tabs", () => {
    it("changes the content of the tabs", () => {
        assert(false)
    })
})