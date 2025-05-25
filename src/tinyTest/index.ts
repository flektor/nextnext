import { TestDescription, Test, TestCase, FinishedTest, TestLog, TestCaseLog, TestResultsLog, TestTreeMap } from "./types"

export class TinyTest {
  test(name: string, fn: VoidFunction) {
    this.tests.push({ name, fn, type: "test", parent: this.currentDescription })
  }

  it(name: string, fn: VoidFunction) {
    this.test(name, fn)
  }

  describe(name: string, fn: VoidFunction) {
    const previousDescription = this.currentDescription
    const newDescription: TestDescription = {
      name,
      fn,
      type: "description",
      parent: previousDescription,
      children: []
    }

    this.tests.push(newDescription)
    this.currentDescription = newDescription

    fn()
    this.currentDescription = previousDescription
  }

  assert(condition: boolean, message = "Assertion failed!") {
    if (!condition) throw new AssertionError(message, condition)
  }

  assertEqual(actual: any, expected: any, message = "") {
    const isObject = (val: any) => typeof val === "object" && val !== null

    if (isObject(actual) && isObject(expected)) {
      if (JSON.stringify(actual) === JSON.stringify(expected)) {
        return
      }
      throw new EqualityAssertionError(message, expected, actual)
    }

    if (actual !== expected) {
      throw new EqualityAssertionError(message, expected, actual)
    }
  }

  runTest(test: TestCase, depth: number): TestLog | Error {
    try { test.fn() } catch (e) { var error = e }

    const result: TestLog = {
      type: test.type,
      name: test.name,
      depth,
    }

    if (!error) {
      return result
    }

    if (error instanceof AssertionError || error instanceof EqualityAssertionError) {
      return { ...result, error }
    }

    return new Error(JSON.stringify(error))
  }

  runAllTests(logger: Logger) {
    const testTree = this.buildTestTree(this.tests)
    const executeAllTests = (parent: TestDescription | undefined = undefined, depth = 0) => {
      const tests = testTree.get(parent) || []

      for (const test of tests) {
        if (test.type === "test") {
          const result = this.runTest(test, depth + 1) as TestCaseLog
          result.error ? failed++ : passed++
          logger.log(result)
          continue
        }
        // otherwise  type === 'description'
        logger.log({
          type: test.type,
          name: test.name,
          depth,
        } as TestLog)

        const previousDescription = this.currentDescription
        this.currentDescription = test
        executeAllTests(test, depth + 1)
        this.currentDescription = previousDescription
      }
    }

    let passed = 0
    let failed = 0

    logger.log("Running tests...")

    executeAllTests()

    logger.log({ passed, failed, type: 'results' } as TestResultsLog)
  }

  private tests: Test[] = []
  private currentDescription: TestDescription | undefined

  private buildTestTree(tests: Test[]) {
    const tree: TestTreeMap = new Map()

    for (const test of tests) {
      const parent = test.parent || undefined
      if (!tree.has(parent)) {
        tree.set(parent, [])
      }
      tree.get(parent)!.push(test)
    }

    return tree
  }
}

export class Logger {
  logs: any[] = []
  callback: Function

  constructor({ onLog }: { onLog: Function }) {
    this.callback = onLog
  }

  log(...params: any[]) {
    this.logs.push({ ...params })
    this.callback(...params)
  }
}

export class AssertionError extends Error {
  condition: boolean;

  constructor(message: string, condition: boolean) {
    super(message);
    this.name = "AssertionError";
    this.condition = condition;
  }
}

export class EqualityAssertionError extends Error {
  expected: any;
  actual: any;

  constructor(message: string, expected: any, actual: any) {
    super(message);
    this.name = "EqualityAssertionError";
    this.expected = expected;
    this.actual = actual;
  }
}

const tinyTestInstance = new TinyTest()

export default tinyTestInstance
export const test = tinyTestInstance.test.bind(tinyTestInstance)
export const it = tinyTestInstance.it.bind(tinyTestInstance)
export const describe = tinyTestInstance.describe.bind(tinyTestInstance)
export const assertEqual = tinyTestInstance.assertEqual.bind(tinyTestInstance)
export const assert = tinyTestInstance.assert.bind(tinyTestInstance)