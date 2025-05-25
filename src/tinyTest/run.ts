import { readdirSync, readFileSync, statSync } from 'fs'
import { join } from 'path'
import tinyTest, { Logger } from './index'
import { TestLog } from './types'
import { beautifyTestLog } from './helpers'
import { importPage } from '../jsxFileReader'


function readProjectConfig() {
  try {
    const filePath = join(__dirname, '../..', 'project.json')
    const rawData = readFileSync(filePath, 'utf-8')
    return JSON.parse(rawData)
  } catch (err) {
    console.error(`Error reading project configurations: ${err}`)
    return null
  }
}

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
const project = readProjectConfig()
const testFiles = findAllTestFiles(join(__dirname, '..'))
  .concat(findAllTestFiles(project.root))

testFiles.forEach(file => {
  if (file.endsWith(".jsx") || file.endsWith(".tsx")) {
    return importPage(file)
  }
  
  return require(file)
})

console.log(testFiles)

const logger = new Logger({
  onLog: (log: TestLog) => console.log(beautifyTestLog(log))
})

tinyTest.runAllTests(logger)


