/* eslint-env mocha */
const assert = require('assert')
const cleanupTestApp = require('./util/cleanupTestApp')
const path = require('path')
const appDir = path.join(__dirname, 'app/paramFunctionTest')
const fs = require('fs')
const { execSync } = require('child_process')

describe('Testing script fallback-dep.js', function () {
  beforeEach(function (done) {
    execSync('node fallback-dep.js')
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

  it('Testing if node fallback-dep.js creates a clones and repos folder in the ./test folder', function (done) {
  // test to see if ./test/clones exist
    assert(fs.existsSync('./test/clones') === true, './test/clones does not exist')
    // test to see if ./test/repos exist
    assert(fs.existsSync('./test/repos') === true, './test/repos does not exist')
    done()
  })

  it('Testing if node fallback-dep.js creates three repos in the ./test/repos folder', function (done) {
    // test to see if ./test/repos/repo1 exist
    assert(fs.existsSync('./test/repos/repo1') === true, './test/repos/repo1 does not exist')
    // test to see if ./test/repos/repo2 exist
    assert(fs.existsSync('./test/repos/repo2') === true, './test/repos/repo2 does not exist')
    // test to see if ./test/repos/repo3 exist
    assert(fs.existsSync('./test/repos/repo3') === true, './test/repos/repo3 does not exist')
    done()
  })

  it('Testing if node fallback-dep.js creates three clones of the repos in the ./test/clones folder', function (done) {
    // test to see if ./test/clones/repo1 exist
    assert(fs.existsSync('./test/clones/repo1') === true, './test/clones/repo1 does not exist')
    // test to see if ./test/clones/repo2 exist
    assert(fs.existsSync('./test/clones/repo2') === true, './test/clones/repo2 does not exist')
    // test to see if ./test/clones/repo3 exist
    assert(fs.existsSync('./test/clones/repo3') === true, './test/clones/repo3 does not exist')
    done()
  })
})
