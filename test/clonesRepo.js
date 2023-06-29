/* eslint-env mocha */
const assert = require('assert')
const cleanupTestApp = require('./util/cleanupTestApp')
// const fallback = require('./fallback-dep.js')

const path = require('path')
const appDir = path.join(__dirname, 'app/paramFunctionTest')
const fs = require('fs')
const { execSync } = require('child_process')

describe('Testing files in the clones/repo#', function () {
before(function (done) {
    // Run fallback dependancy script
    execSync('node ./../../fallbackDep.js')
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

it('Testing all files in clones/repo1', function () {
    // test to see if ./test/clones/repo1/node_modules exist
    assert(fs.existsSync(path.join(__dirname, '/clones/repo1/lib')) === true, './test/clones/repo1/lib does not exist')
    // test to see if ./test/clones/repo1/node_modules exist
    assert(fs.existsSync(path.join(__dirname, '/clones/repo1/node_modules')) === true, './test/clones/repo1/node_modules does not exist')
    // test to see if ./test/clones/repo1/package.json exist
    assert(fs.existsSync(path.join(__dirname, '/clones/repo1/package.json')) === true, './test/clones/repo1/package.json does not exist')
    // test to see if ./test/clones/repo1/package-lock.json exist
    assert(fs.existsSync(path.join(__dirname, '/clones/repo1/package-lock.json')) === true, './test/clones/repo1/package-lock.json does not exist')
})
it('Testing all files in clones/repo2', function () {
    // test to see if ./test/clones/repo2/package.json exist
    assert(fs.existsSync(path.join(__dirname, '/clones/repo2/package.json')) === true, './test/clones/repo2/package.json does not exist')
    // test to see if ./test/clones/repo2/package-lock.json exist
    assert(fs.existsSync(path.join(__dirname, '/clones/repo2/package-lock.json')) === true, './test/clones/repo2/package-lock.json does not exist')
})
it('Testing all files in clones/repo3', function () {
    // test to see if ./test/clones/repo3/package.json exist
    assert(fs.existsSync(path.join(__dirname, '/clones/repo1/package.json')) === true, './test/clones/repo3/package.json does not exist')
    // test to see if ./test/clones/repo3/package-lock.json exist
    assert(fs.existsSync(path.join(__dirname, '/clones/repo1/package-lock.json')) === true, './test/clones/repo3/package-lock.json does not exist')
})
})
