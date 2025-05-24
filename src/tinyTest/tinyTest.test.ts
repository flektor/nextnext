
import { describe, it, assertEqual, assert, TinyTest, Logger } from '../tinyTest'
import { beautifyTestLog } from './helpers'
import { TestLog } from './types'

describe('TinyTest', () => {

    describe('Assertions', () => {

        describe('Assert the assert 😆', () => {

            it('does not throw if the condition is true', () => {
                try {
                    assert(true)
                    var passed = true
                } catch {
                    passed = false
                }

                assert(passed)
            })


            it('throws if the condition is false', () => {
                try {
                    assert(false)
                    var failed = false
                } catch {
                    failed = true
                }
                assert(failed)
            })

        })


        describe('Assert the assertEqual', () => {

            describe('The arguments match', () => {

                it('does not throw with: true, true', () => {
                    try {
                        assertEqual(true, true)
                        var passed = true
                    } catch (error) {
                        passed = false
                    }

                    assert(passed)
                })


                it('does not throw with: false, false', () => {
                    try {
                        assertEqual(false, false)
                        var passed = true
                    } catch (error) {
                        passed = false
                    }

                    assert(passed)
                })
            })


            describe('The arguments do not match', () => {

                it('throws with: true, false', () => {
                    try {
                        assertEqual(true, false)
                        var failed = false
                    } catch (error) {
                        failed = true
                    }

                    assert(failed)
                })

                it('throws with: false, true', () => {
                    try {
                        assertEqual(false, true)
                        var failed = false
                    } catch (error) {
                        failed = true
                    }

                    assert(failed)
                })
            })
        })
    })


    describe('Console UI', () => {

        describe('Log text output format', () => {

            it('outputs the correct indentations, colors and icons', () => {
                const tinyTest = new TinyTest()
                tinyTest.describe('folder icon', () => {
                    tinyTest.it('green check icon', () => tinyTest.assert(true))
                    tinyTest.it('red cross icon', () => tinyTest.assert(false))
                })

                let output = ''
                const logger = new Logger({
                    onLog: (log: TestLog) => output += beautifyTestLog(log) + '\n'
                })

                tinyTest.runAllTests(logger)

                // const regexOneLine = /^Running tests...\n📂 folder icon\n    ✅ \x1b\[32mgreen check icon\x1b\[0m\n    ❌ \x1b\[31mred cross icon\x1b\[0m\n\n\x1b\[31mAssertion failed!\x1b\[0m\n(?:.*\n)?\n*\n✅ \x1b\[32mPassed: 1\x1b\[0m\n❌ \x1b\[31mFailed: 1\x1b\[0m\n$/
                assert(new RegExp(
                    `^Running tests...\\n` +
                    `📂 folder icon\\n` +
                    `    ✅ \\x1b\\[32mgreen check icon\\x1b\\[0m\\n` +
                    `    ❌ \\x1b\\[31mred cross icon\\x1b\\[0m\\n` +
                    `\\n` +
                    `\\x1b\\[31mAssertion failed!\\x1b\\[0m\\n` +
                    `(?:.*\\n)?` +  // Matches the dynamic error message line (optional)
                    `\\n*` +        // Allows multiple newlines
                    `✅ \\x1b\\[32mPassed: 1\\x1b\\[0m\\n` +
                    `❌ \\x1b\\[31mFailed: 1\\x1b\\[0m\\n$`,
                    // "m" // Multi-line flag
                ).test(output))
            })
        })


        describe('Nested descriptions', () => {

            const tinyTest = new TinyTest()

            function createDeepNestedTest(descriptions: string[]) {
                while (descriptions.length > 1) {
                    tinyTest.describe(descriptions.pop() as string, () => createDeepNestedTest(descriptions))
                    return
                }
                const tests = () => tinyTest.it('Supports more than 10 nested descriptions', () => tinyTest.assert(true))
                tinyTest.describe(descriptions[0], tests)
            }


            it('is able to have deep nested descriptions', () => {
                const size = 11
                const descriptions = Array(size).fill('Level ').map((text, i) => text + (i + 1)).reverse()
                createDeepNestedTest(descriptions)

                const output: string[] = []
                const logger = new Logger({
                    onLog: (log: TestLog) => output.push(beautifyTestLog(log))
                })

                tinyTest.runAllTests(logger)

                assertEqual('Running tests...', output[0])

                for (let i = 1; i <= size; i++) {
                    const expected = `${'  '.repeat(i - 1)}📂 Level ${i}`
                    assertEqual(expected, output[i])
                }

                assertEqual(`${'  '.repeat(size + 1)}✅ \x1B[32mSupports more than 10 nested descriptions\x1B[0m`, output[size + 1])
                assertEqual(`\n✅ \x1B[32mPassed: 1\x1B[0m\n❌ \x1B[31mFailed: 0\x1B[0m`, output[size + 2])
                assertEqual(size + 3, output.length)
            })
        })
    })
})
