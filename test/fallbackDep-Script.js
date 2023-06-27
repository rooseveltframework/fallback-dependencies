/* eslint-env mocha */
// wipe out test app after each test
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

  it('Testing if node fallback-dep.js creates a clones and repos folder in the ./test folder', function () {
  // test
    assert(fs.existsSync('./test/clones') === true, './test/clones does not exist')
  })
})
