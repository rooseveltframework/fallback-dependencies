/* eslint-env mocha */
const assert = require('assert')
const cleanupTestApp = require('./util/cleanupTestApp')
// const fallback = require('./fallback-dep.js')

const path = require('path')
const appDir = path.join(__dirname, 'app/paramFunctionTest')
const errorHandlerSandBox = path.join(__dirname, './util/reposFile.js')
const fs = require('fs')

describe('Testing error handlers', function () {
  before(function (done) {
    // Creat new repos and clones folder
    fs.rmSync(path.resolve('./test/clones'), { recursive: true, force: true })
    fs.rmSync(path.resolve('./test/repos'), { recursive: true, force: true })

    // Run fallback dependancy script
    try {
      require(errorHandlerSandBox)()
    } catch (err) {
      console.log(err)
    }
    this.timeout(40000)
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

  // // Testing line 10 <-- NOT WORKING
  it('Checking to see if `fallback-dependencies` still works if repos is non-presence', function () {
    assert(fs.existsSync(path.join(__dirname, './clones/repo4/lib')) === true, './clones/repo4/lib does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo4/lib/fallback-deps-test-repo-5')) === true, './clones/repo4/lib/fallback-deps-test-repo-5 does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo4/lib/fallback-deps-test-repo-5/lib')) === true, './clones/repo4/lib/fallback-deps-test-repo-5/lib does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo4/lib/fallback-deps-test-repo-5/lib/fallback-deps-test-repo-6')) === false, './clones/repo4/lib/fallback-deps-test-repo-5/lib/fallback-deps-test-repo-6 does exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo4/lib/fallback-deps-test-repo-5/lib/fallback-deps-test-repo-6/package-lock.json')) === false, './clones/repo4/lib/fallback-deps-test-repo-5/lib/fallback-deps-test-repo-6/package-lock.json does exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo4/lib/fallback-deps-test-repo-5/lib/fallback-deps-test-repo-6/package.json')) === false, './clones/repo4/lib/fallback-deps-test-repo-5/lib/fallback-deps-test-repo-6/package.json does exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo4/lib/fallback-deps-test-repo-5/lib/fallback-deps-test-repo-6/lib')) === false, './clones/repo4/lib/fallback-deps-test-repo-5/lib/fallback-deps-test-repo-6/lib does exist')
  })
})
