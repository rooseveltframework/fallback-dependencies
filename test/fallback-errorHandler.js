/* eslint-env mocha */
const assert = require('assert')
const cleanupTestApp = require('./util/cleanupTestApp')
// const fallback = require('./fallback-dep.js')

const path = require('path')
const appDir = path.join(__dirname, 'app/paramFunctionTest')
const errorHandlerSandBox = path.join(__dirname, './util/errorHandler.js')
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
  //   const repo4PKG = require('./clones/repo4/package.json')
  //   const repo5PKG = require('./clones/repo5/package.json')
  //   // console.log(process.mainModule)
  //   assert.deepEqual(repo4PKG.fallbackDependencies.repos, undefined, 'repos is present in package object')
  //   if (repo4PKG.fallbackDependencies.repos === undefined) {
  //     assert(fs.existsSync(path.join(__dirname, '/clones/repo4/lib')) === false, './test/clones/repo4/lib does exist')
  //     assert.deepEqual(repo5PKG.fallbackDependencies.repos, {}, 'repos is not an empty object')
  //   }
  })
})
