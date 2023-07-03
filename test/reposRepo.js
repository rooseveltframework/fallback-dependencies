/* eslint-env mocha */
const assert = require('assert')
const cleanupTestApp = require('./util/cleanupTestApp')
const path = require('path')
const appDir = path.join(__dirname, 'app/paramFunctionTest')
const fallBackSandBox = path.join(__dirname, './util/fallbackDep.js')
const fs = require('fs')
const { execSync } = require('child_process')

describe('Checking if ./repos contains all files per repo#', function () {
  before(function (done) {
    // Run fallback dependancy script
    execSync(`node ${fallBackSandBox}`)
    this.timeout(20000)
    done()
  })
  // delete the test app Directory and start with a clean state after each test
  afterEach(function (done) {
    cleanupTestApp(appDir, (err) => {
      if (err) {
        throw err
      } else {
        done()
      }
    })
  })

  it('Testing if files in repo1 exist', function () {
    // test to see if ./test/repos/repo1/hooks exist
    assert(fs.existsSync(path.join(__dirname, '/repos/repo1/hooks')) === true, './test/repos/repo1/hooks does not exist')
    // test to see if ./test/repos/repo1/info exist
    assert(fs.existsSync(path.join(__dirname, '/repos/repo1/info')) === true, './test/repos/repo1/info does not exist')
    // test to see if ./test/repos/repo1/objects exist
    assert(fs.existsSync(path.join(__dirname, '/repos/repo1/objects')) === true, './test/repos/repo1/objects does not exist')
    // test to see if ./test/repos/repo1/refs exist
    assert(fs.existsSync(path.join(__dirname, '/repos/repo1/refs')) === true, './test/repos/repo1/refs does not exist')
    // test to see if ./test/repos/repo1/config exist
    assert(fs.existsSync(path.join(__dirname, '/repos/repo1/config')) === true, './test/repos/repo1/config does not exist')
    // test to see if ./test/repos/repo1/description exist
    assert(fs.existsSync(path.join(__dirname, '/repos/repo1//description')) === true, './test/repos/repo1/description does not exist')
    // test to see if ./test/repos/repo1/HEAD exist
    assert(fs.existsSync(path.join(__dirname, '/repos/repo1/HEAD')) === true, './test/repos/repo1/HEAD does not exist')
  })

  it('Testing if files in repo2 exist', function () {
    // test to see if ./test/repos/repo2/hooks exist
    assert(fs.existsSync(path.join(__dirname, '/repos/repo2/hooks')) === true, './test/repos/repo1/hooks does not exist')
    // test to see if ./test/repos/repo2/info exist
    assert(fs.existsSync(path.join(__dirname, '/repos/repo2/info')) === true, './test/repos/repo2/info does not exist')
    // test to see if ./test/repos/repo2/objects exist
    assert(fs.existsSync(path.join(__dirname, '/repos/repo2/objects')) === true, './test/repos/repo2/objects does not exist')
    // test to see if ./test/repos/repo2/refs exist
    assert(fs.existsSync(path.join(__dirname, '/repos/repo2/refs')) === true, './test/repos/repo2/refs does not exist')
    // test to see if ./test/repos/repo2/config exist
    assert(fs.existsSync(path.join(__dirname, '/repos/repo2/config')) === true, './test/repos/repo2/config does not exist')
    // test to see if ./test/repos/repo2/description exist
    assert(fs.existsSync(path.join(__dirname, '/repos/repo2/description')) === true, './test/repos/repo2/description does not exist')
    // test to see if ./test/repos/repo2/HEAD exist
    assert(fs.existsSync(path.join(__dirname, '/repos/repo2/HEAD')) === true, './test/repos/repo2/HEAD does not exist')
  })

  it('Testing if files in repo3 exist', function () {
    // test to see if ./test/repos/repo3/hooks exist
    assert(fs.existsSync(path.join(__dirname, '/repos/repo3/hooks')) === true, './test/repos/repo3/hooks does not exist')
    // test to see if ./test/repos/repo3/info exist
    assert(fs.existsSync(path.join(__dirname, '/repos/repo3/info')) === true, './test/repos/repo3/info does not exist')
    // test to see if ./test/repos/repo3/objects exist
    assert(fs.existsSync(path.join(__dirname, '/repos/repo3/objects')) === true, './test/repos/repo3/objects does not exist')
    // test to see if ./test/repos/repo3/refs exist
    assert(fs.existsSync(path.join(__dirname, '/repos/repo3/refs')) === true, './test/repos/repo3/refs does not exist')
    // test to see if ./test/repos/repo3/config exist
    assert(fs.existsSync(path.join(__dirname, '/repos/repo3/config')) === true, './test/repos/repo3/config does not exist')
    // test to see if ./test/repos/repo3/description exist
    assert(fs.existsSync(path.join(__dirname, '/repos/repo3/description')) === true, './test/repos/repo3/description does not exist')
    // test to see if ./test/repos/repo3/HEAD exist
    assert(fs.existsSync(path.join(__dirname, '/repos/repo3/HEAD')) === true, './test/repos/repo3/HEAD does not exist')
  })
})
