
import tinyTestInstance, { describe, it, assertEqual, assert, TinyTest, Logger } from '../tinyTest'
import { beautifyTestLog } from './helpers'
import { Test, TestDescription, TestLog } from './types'

describe('TinyTest', () => {

    describe('Assertions', () => {

        describe('Assert the assert 😆', () => {

            it('should not throw if the condition is true', () => {
                try {
                    assert(true)
                    var passed = true
                } catch {
                    passed = false
                }

                assert(passed)
            })


            it('should throw if the condition is false', () => {
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

                it('should not throw with: true, true', () => {
                    try {
                        assertEqual(true, true)
                        var passed = true
                    } catch (error) {
                        passed = false
                    }

                    assert(passed)
                })


                it('should not throw with: false, false', () => {
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

                it('should throw with: true, false', () => {
                    try {
                        assertEqual(true, false)
                        var failed = false
                    } catch (error) {
                        failed = true
                    }

                    assert(failed)
                })

                it('should throw with: false, true', () => {
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

            it('should output the correct indentations, colors and icons', () => {
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


            it('should be able to have deep nested descriptions', () => {
                const descriptions = Array(11).fill('Level ').map((text, i) => text + (i + 1)).reverse()
                createDeepNestedTest(descriptions)

                let output = ''
                const logger = new Logger({
                    onLog: (log: TestLog) => output += beautifyTestLog(log) + '\n'
                })

                const expected = `Running tests...
📂 Level 1
  📂 Level 2
    📂 Level 3
      📂 Level 4
        📂 Level 5
          📂 Level 6
            📂 Level 7
              📂 Level 8
                📂 Level 9
                  📂 Level 10
                    📂 Level 11
                        ✅ \x1B[32mSupports more than 10 nested descriptions\x1B[0m\n
✅ \x1B[32mPassed: 1\x1B[0m
❌ \x1B[31mFailed: 0\x1B[0m\n`

                tinyTest.runAllTests(logger)
                assertEqual(output, expected)
            })
        })
    })
})
