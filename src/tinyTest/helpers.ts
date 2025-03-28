import { AssertionError, EqualityAssertionError } from "."
import { TestLog } from "./types"

export function beautify(json: object) {
    return JSON.stringify(json, null, 2)
}

const colors: Record<string, string> = {
    red: "\x1b[31m",
    green: "\x1b[32m",
    blue: "\x1b[34m",
    yellow: "\x1b[33m",
    reset: "\x1b[0m"
}

const red = (text: string) => colors["red"] + text + colors.reset
const green = (text: string) => colors["green"] + text + colors.reset
const yellow = (text: string) => colors["yellow"] + text + colors.reset
const blue = (text: string) => colors["blue"] + text + colors.reset

export function diffHighlight(expected: any, actual: any): string {
    const expLines = beautify(expected).split("\n")
    const actLines = beautify(actual).split("\n")

    return expLines
        .map((line, i) => {
            const lineNum = `${i + 1}`.padStart(3, " ")
            if (line === actLines[i]) return ` ${lineNum}  ${line}`

            const expectedValue: string = red(`-${lineNum}  ${line}`)
            const actualValue: string = red(`${lineNum}  ${actLines[i] ?? ""}`)

            return `${expectedValue}${actualValue}`
        }).join("\n")
}

export function beautifyTestLog(params: TestLog): string {
    switch (params.type) {
        case 'description':
            return `${"  ".repeat(params.depth)}📂 ${params.name}`

        case 'test':
            const { name, depth, error } = params
            const offset = "  ".repeat(depth)

            if (!error) {
                return `${offset}✅ ${green(name)}`
            }

            const lineOfFailure = error.stack && extractSecondLine(error.stack) || ''

            let output = `${offset}❌ ${red(name)}\n`

            if (error instanceof AssertionError) {
                return `${output}\n${red(error.message)}\n${lineOfFailure}\n\n`
            }

            if (error instanceof EqualityAssertionError) {
                const expectedValue = `Expected value: ${green(beautify(error.expected))}`
                const actualValue = `Actual value: ${red(beautify(error.actual))}`
                const errorMessage = `${error.message}\n${expectedValue}\n\n${actualValue}\n`
              
                return `${output}${errorMessage}\n${lineOfFailure}\n\n`
            }

            return output

        case 'results':
            return `\n✅ ${green(`Passed: ${params.passed}`)}\n❌ ${red(`Failed: ${params.failed}`)}`

        default: return params
    }
}

function extractSecondLine(errorStack: string): string | null {
    const lines = errorStack.split("\n").map(line => line.trim())
    return lines.length > 1 ? lines[2] : null
}
