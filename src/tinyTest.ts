type Test = {
  name: string,
  fn: () => void
}

const beautify = (json: any) => JSON.stringify(json, null, 2)

class TinyTest {
  tests: Test[] = [];

  test(name: string, fn: () => void) {
    this.tests.push({ name, fn });
  }

  it(name: string, fn: () => void) {
    this.test(name, fn);
  }

  describe(name: string, fn: () => void) {
    this.tests.push({
      name, fn: () => {
        console.log(`\n📂 ${name}`);
        fn()
      }
    });
  }

  assertEqual(actual: any, expected: any, message = "") {

    const isObjectComparisson = typeof actual === 'object' && typeof expected === 'object'
    const match = () => JSON.stringify(actual) === JSON.stringify(expected)
    // const error = () => new Error(`Assertion failed: ${message}\nExpected: ${beautify(expected)}, but got: ${beautify(actual)}`);
    const error = () => new Error(`Assertion failed: ${message}\nExpected: ${expected}, but got: ${actual}`);

    if (isObjectComparisson) {
      if (match()) return;
      throw error()
    }

    if (actual !== expected) {
      throw error()
    }
  }

  assert(condition: boolean, message = "Assertion failed") {
    if (!condition) {
      throw new Error(message);
    }
  }

  run() {
    let passed = 0;
    let failed = 0;

    console.log("Running tests...");

    for (const { name, fn } of this.tests) {
      try {
        fn();
        console.log(`✅ ${name}`);
        passed++;
      } catch (error: any) {
        console.error(`❌ ${name} - ${error.message}`);
        failed++;
      }
    }

    console.log("\nTest Results:");
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);

    process.exit(failed ? 1 : 0); // Ensure proper exit codes for CI
  }

}

// module.exports = TinyTest;

// Create a global instance so we can call `test` and `assertEqual` globally
const tinyTestInstance = new TinyTest();
// globalThis.test = tinyTestInstance.test.bind(tinyTestInstance);
// globalThis.assertEqual = tinyTestInstance.assertEqual.bind(tinyTestInstance);

// Export instance so we can trigger `.run()` later
export default tinyTestInstance;