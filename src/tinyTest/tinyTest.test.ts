
import { describe, it, assertEqual, assert } from '../tinyTest';

describe('Testing TinyTest', () => {

    describe('Assertions', () => {

        describe('Assert the assert 😆', () => {

            it('should not throw if the condition is true', () => {
                try {
                    assert(true)
                    var passed = true
                } catch (error) {
                    passed = false
                }

                assert(passed)
            })

            it('should throw if the condition is false', () => {
                try {
                    assert(false)
                    var failed = false
                } catch (error) {
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
                it('should throw with: false, true', () => {
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
})
