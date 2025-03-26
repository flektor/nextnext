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

export function colorize(text: string) {
    return {
        red: () => colors["red"] + text + colors.reset,
        green: () => colors["green"] + text + colors.reset,
        yellow: () => colors["yellow"] + text + colors.reset,
        blue: () => colors["blue"] + text + colors.reset
    }
}

export function diffHighlight(expected: any, actual: any): string {
    const expLines = beautify(expected).split("\n")
    const actLines = beautify(actual).split("\n")

    return expLines
        .map((line, i) => {
            const lineNum = `${i + 1}`.padStart(3, " ")
            if (line === actLines[i]) return ` ${lineNum}  ${line}`

            const expectedValue: string = colorize(`-${lineNum}  ${line}`).red()
            const actualValue: string = colorize(`${lineNum}  ${actLines[i] ?? ""}`).green()

            return `${expectedValue}${actualValue}`
        }).join("\n")
}
