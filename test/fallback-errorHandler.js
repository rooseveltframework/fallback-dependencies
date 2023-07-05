/* eslint-env mocha */
const assert = require('assert')
const cleanupTestApp = require('./util/cleanupTestApp')
// const fallback = require('./fallback-dep.js')

const path = require('path')
const appDir = path.join(__dirname, 'app/paramFunctionTest')
const errorHandlerSandBox = path.join(__dirname, './util/errorHandler.js')
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
    } catch (err) { console.log(err) }
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

  it.only('Checking to see if `fallback-dependencies` is declared in `devDependencies` in your app', function () {
    const pkg = require('./clones/repo4/package.json')
    if (pkg.fallbackDependencies.repos === undefined) {
      // try {
      //   execSync(`node ${errorHandlerSandBox}`)
      // } catch (err) { console.log(err) }
    }
    const nodeFD = require('./clones/repo4/node_modules/fallback-dependencies')

    console.log(nodeFD)
    // console.log(pkg.fallbackDependencies.repos)

    assert(pkg.devDependencies !== undefined, '`fallback-dependencies` is not declared in `devDependencies`')
  })
})
