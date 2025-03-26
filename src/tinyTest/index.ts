import { beautify, colorize, diffHighlight } from "./helpers"
import { TestDescription, Test, TestCase, FinishedTest } from "./types"

class TinyTest {
  tests: Test[] = []
  currentDescription: TestDescription | undefined

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

    try {
      fn()
    } finally {
      this.currentDescription = previousDescription
    }
  }

  assert(condition: boolean, message = "Assertion failed!") {
    if (!condition) {
      throw new Error(message)
    }
  }

  assertEqual(actual: any, expected: any, message = "") {
    const isObject = (val: any) => typeof val === "object" && val !== null

    if (isObject(actual) && isObject(expected)) {
      if (JSON.stringify(actual) === JSON.stringify(expected)) {
        return
      }

      throw new Error(`Assertion failed:\n\n${message}\n${diffHighlight(expected, actual)}\n`)
    }

    if (actual !== expected) {
      throw this.createAssertionFailedError(actual, expected, message)
    }
  }

  createAssertionFailedError(actual: any, expected: any, message: string) {
    const expectedValue = `Expected value: ${colorize(beautify(expected)).red()}`;
    const actualValue = `Actual value: ${colorize(beautify(actual)).green()}`;
    return new Error(`${colorize('Assertion failed!').red()} ${message}\n\n${expectedValue}\n\n${actualValue}\n`);
  }

  buildTestTree = () => {
    const tree = new Map<TestDescription | undefined, Test[]>();

    for (const test of this.tests) {
      const parent = test.parent || undefined;
      if (!tree.has(parent)) {
        tree.set(parent, []);
      }
      tree.get(parent)!.push(test);
    }

    return tree;
  };

  run() {
    let passedCount = 0;
    let failedCount = 0;

    const runTest = (test: TestCase, depth: number) => {
      try {
        test.fn();
        passedCount++;
        console.log("  ".repeat(depth) + `✅ ${colorize(test.name).green()}`);
      } catch (error: any) {
        failedCount++;
        console.log("  ".repeat(depth) + `❌ ${colorize(`${test.name} - `).red()}${error.message}`);
      }
    };

    const executeTests = (parent: TestDescription | undefined = undefined, depth = 0) => {
      const tests = testTree.get(parent) || [];

      for (const test of tests) {
        if (test.type === "description") {
          console.log(`${"  ".repeat(depth)}📂 ${test.name}`);
          const previousDescription = this.currentDescription;
          this.currentDescription = test;

          executeTests(test, depth + 1);

          this.currentDescription = previousDescription;
        } else if (test.type === "test") {
          runTest(test, depth + 1);
        }
      }
    };

    console.log("Running tests...\n");

    const testTree = this.buildTestTree();
    executeTests();

    console.log(`\n✅ Passed: ${passedCount}`);
    console.log(`❌ Failed: ${failedCount}`);
  }

  getFullDescription(test: Test): string {
    let description = ""
    let current = test.parent
    while (current) {
      const updatedDescription = `${current.name + "\n  " + description}`
      description = description ? updatedDescription : current.name
      current = current.parent
    }

    return description
  }

  orderedTests: Set<FinishedTest> = new Set()

  orderTest(test: Test) {
    const ancestorsStack = []
    let current = test.parent

    while (current) {
      ancestorsStack.push(current)
      current = current.parent
    }

    if (current) {
      this.orderedTests.add(current)
    }
  }
}

const tinyTestInstance = new TinyTest()

export default tinyTestInstance
export const test = tinyTestInstance.test.bind(tinyTestInstance)
export const it = tinyTestInstance.it.bind(tinyTestInstance)
export const describe = tinyTestInstance.describe.bind(tinyTestInstance)
export const assertEqual = tinyTestInstance.assertEqual.bind(tinyTestInstance)
export const assert = tinyTestInstance.assert.bind(tinyTestInstance)