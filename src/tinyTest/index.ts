type Test = {
  name: string,
  fn: () => void
}

const beautify = (json: any) => JSON.stringify(json, null, 2)

class TinyTest {
  tests: Test[] = []

  test(name: string, fn: () => void) {
    this.tests.push({ name, fn })
  }

  it(name: string, fn: () => void) {
    this.test(name, fn)
  }

  describe(name: string, fn: () => void) {
    this.tests.push({
      name, fn: () => {
        console.log(`\n📂 ${name}`)
        fn()
      }
    })
  }
  
  colorize(text: string, color: "red" | "green"): string {
    const colors: Record<string, string> = { red: "\x1b[31m", green: "\x1b[32m", reset: "\x1b[0m" }
    return colors[color] + text + colors.reset
  }

  beautify(obj: any): string {
    return JSON.stringify(obj, null, 2)
  }

  diffHighlight(expected: any, actual: any): string {
    const expLines = beautify(expected).split("\n")
    const actLines = beautify(actual).split("\n")

    return expLines
      .map((line, i) => {
        const lineNum = `${i + 1}`.padStart(3, " ")
        if (line === actLines[i]) return ` ${lineNum}  ${line}`
        return (
          `${this.colorize(`-${lineNum}  ${line}`, "red")}\n` +
          `${this.colorize(`+${lineNum}  ${actLines[i] || ""}`, "green")}`
        )
      })
      .join("\n")
  }

  assertEqual(actual: any, expected: any, message = ""): void {
    const isObject = (val: any) => typeof val === "object" && val !== null

    if (isObject(actual) && isObject(expected)) {
      if (JSON.stringify(actual) === JSON.stringify(expected)) return;
      throw new Error(`Assertion failed: ${message}\n${this.diffHighlight(expected, actual)}`)
    }

    if (actual !== expected) {
      const expectedValue = this.colorize(beautify(expected), "red")
      const actualValue = this.colorize(beautify(actual), "green")

      throw new Error(
        `Assertion failed${message}\n\n Expected:\n ${expectedValue}\n\nActual:\n ${actualValue}\n`
      )
    }
  }

  assert(condition: boolean, message = "Assertion failed") {
    if (!condition) {
      throw new Error(message)
    }
  }

  run() {
    let passedCount = 0
    let failedCount = 0

    console.log("Running tests...")

    for (const { name, fn } of this.tests) {
      try {
        fn()
        console.log(this.colorize(`✅ ${name}`, "green"))
        passedCount++
      } catch (error: any) {
        console.error(`❌ ${this.colorize(name, "red")}\n${error.message}`)
        failedCount++
      }
    }

    console.log("\nTest Results:")
    console.log(this.colorize(`✅ Passed: ${passedCount}`, "green"))
    console.log(this.colorize(`❌ Failed: ${failedCount}`, "red"))

    process.exit(failedCount ? 1 : 0)
  }

}


const tinyTestInstance = new TinyTest()

export default tinyTestInstance