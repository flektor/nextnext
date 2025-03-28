import { readdirSync, statSync } from 'fs'
import { join } from 'path'
import tinyTest, { Logger } from './index'
import { TestLog } from './types'
import { beautifyTestLog } from './helpers'

const TEST_FILENAME_REGEX = /\.test\.(ts|js)$/

export const findAllTestFiles = (dir: string): string[] => {
  let results: string[] = []
  const files = readdirSync(dir)
  files.forEach(file => {
    const filePath = join(dir, file)

    if (statSync(filePath).isDirectory()) {
      results = results.concat(findAllTestFiles(filePath))
    } else if (file.match(TEST_FILENAME_REGEX)) {
      results.push(filePath)
    }
  })

  return results
}

const testFiles = findAllTestFiles(join(__dirname, '..'))
testFiles.forEach(file => require(file))

const logger = new Logger({
  onLog: (log: TestLog) => console.log(beautifyTestLog(log))
})

tinyTest.runAllTests(logger)