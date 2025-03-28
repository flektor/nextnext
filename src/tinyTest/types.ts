import { AssertionError, EqualityAssertionError } from "."

export type TestCaseResult = true | Error

export type TestCaseMetaData = {
    result: 'passed' | 'failed' | 'flaky' | null
    tries: TestCaseResult[]
}

export type TestDescriptionMetaData = {
    passed: number
    failed: Error[]
}

export type TestCase = {
    type: "test"
    name: string
    fn: VoidFunction
    parent?: TestDescription
    meta?: TestCaseMetaData
}

export type TestDescription = {
    type: "description"
    name: string
    fn: VoidFunction
    children: Test[]
    parent?: TestDescription
    meta?: TestDescriptionMetaData
}

export type Test = TestCase | TestDescription

export type FinishedTestCase = TestCase & {
    meta: TestCaseMetaData
}

export type FinishedTestDescription = TestDescription & {
    meta: TestDescriptionMetaData
}

export type FinishedTest = (FinishedTestCase | FinishedTestDescription) & {
    parent: FinishedTest
}

export type TestTreeMap = Map<TestDescription | undefined, Test[]>

export type TestCaseLog = {
    type: 'test'
    name: string
    depth: number
    error?: TestCaseError
}

export type DescriptionLog = {
    type: 'description'
    name: string
    depth: number
}

export type TestResultsLog = {
    type: 'results'
    passed: number
    failed: number
}

export type TestLog = TestCaseLog | DescriptionLog | TestResultsLog

type AssertionErrorType = AssertionError & { type: 'AssertionError' }
type EqualityAssertionErrorType = EqualityAssertionError & { type: 'EqualityAssertionError' }

export type TestCaseError = AssertionError | EqualityAssertionError