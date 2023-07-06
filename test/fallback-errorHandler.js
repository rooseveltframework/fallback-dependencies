/* eslint-env mocha */
const assert = require('assert')
const cleanupTestApp = require('./util/cleanupTestApp')
// const fallback = require('./fallback-dep.js')

const path = require('path')
const appDir = path.join(__dirname, 'app/paramFunctionTest')
const errorHandlerSandBox = path.join(__dirname, './util/errorHandler.js')
let errhandler
let skipDeps = false

const fs = require('fs')
const { execSync } = require('child_process')

describe('Testing error handlers', function () {
  before(function (done) {
    if (fs.existsSync(path.join(__dirname, '/clones')) === true) {
      execSync('rm -R ./test/clones')
    }
    if (fs.existsSync(path.join(__dirname, '/repos')) === true) {
      execSync('rm -R ./test/repos')
    }
    // Run fallbac k dependancy script
    try {
      execSync(`node ${errorHandlerSandBox}`)
    } catch (err) {
      console.log(err)
    }
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

  // // Testing line 10 <-- NOT WORKING
  // it('Checking to see if `fallback-dependencies` still works if repos is non-presence', function () {
  //   const repo4PKG = require('./clones/repo4/package.json')
  //   const repo5PKG = require('./clones/repo5/package.json')
  //   // console.log(process.mainModule)
  //   assert.deepEqual(repo4PKG.fallbackDependencies.repos, undefined, 'repos is present in package object')
  //   if (repo4PKG.fallbackDependencies.repos === undefined) {
  //     assert(errhandler === undefined, 'Repo is non-present in package.json causing an err')
  //     assert(fs.existsSync(path.join(__dirname, '/clones/repo4/lib')) === false, './test/clones/repo4/lib does exist')
  //     assert.deepEqual(repo5PKG.fallbackDependencies.repos, {}, 'repos is not an empty object')
  //   }
  // })
})
