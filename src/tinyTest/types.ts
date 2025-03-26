


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