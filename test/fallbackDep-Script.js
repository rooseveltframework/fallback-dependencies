/* eslint-env mocha */
const assert = require('assert')
const cleanupTestApp = require('./util/cleanupTestApp')
// const fallback = require('./fallback-dep.js')

const path = require('path')
const appDir = path.join(__dirname, 'app/paramFunctionTest')
const fallbackSandBox = path.join(__dirname, './util/fallbackSandBox.js')

const fs = require('fs')

describe('Testing script fallbackDep.js', function () {
  this.timeout(80000)
  before(function (done) {
    // Checks if the clones folder exist, if so delete it
    if (fs.existsSync(path.join(__dirname, './clones'))) {
      fs.rmSync(path.join(__dirname, './clones'), { recursive: true, force: true })
    }
    // Checks if the repos folder exist, if so delete it
    if (fs.existsSync(path.join(__dirname, './repos'))) {
      fs.rmSync(path.join(__dirname, './repos'), { recursive: true, force: true })
    }
    // Run fallback dependancy script
    try {
      require(fallbackSandBox)()
    } catch (err) {
      console.log(err)
    }
    done()
  })
  // delete the test app Directory and start with a clean state after each test
  after(function (done) {
    fs.rmSync(path.join(__dirname, './clones'), { recursive: true, force: true })
    fs.rmSync(path.join(__dirname, './repos'), { recursive: true, force: true })

    cleanupTestApp(appDir, (err) => {
      if (err) {
        throw err
      } else {
        done()
      }
    })
  })

  it('Testing if `fallback-dependencies`  works and creates all files intended', function () {
    assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib')) === true, './clones/repo1/lib does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2')) === true, './clones/repo1/lib/fallback-deps-test-repo-2 does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/lib')) === true, './clones/repo1/lib/fallback-deps-test-repo-2/lib does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3')) === true, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3 does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/package-lock.json')) === true, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/package-lock.json does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/package.json')) === true, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/package.json does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/lib')) === false, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/lib does not exist')
  })

  it('Testing if `fallback-dependencies` still works if repos is non-presence and replaced with reposFile', function () {
    assert(fs.existsSync(path.join(__dirname, './clones/repo4/lib')) === true, './clones/repo4/lib does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo4/lib/fallback-deps-test-repo-5')) === true, './clones/repo4/lib/fallback-deps-test-repo-5 does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo4/lib/fallback-deps-test-repo-5/lib')) === true, './clones/repo4/lib/fallback-deps-test-repo-5/lib does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo4/lib/fallback-deps-test-repo-5/lib/fallback-deps-test-repo-6')) === true, './clones/repo4/lib/fallback-deps-test-repo-5/lib/fallback-deps-test-repo-6 does exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo4/lib/fallback-deps-test-repo-5/lib/fallback-deps-test-repo-6/package-lock.json')) === true, './clones/repo4/lib/fallback-deps-test-repo-5/lib/fallback-deps-test-repo-6/package-lock.json does exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo4/lib/fallback-deps-test-repo-5/lib/fallback-deps-test-repo-6/package.json')) === true, './clones/repo4/lib/fallback-deps-test-repo-5/lib/fallback-deps-test-repo-6/package.json does exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo4/lib/fallback-deps-test-repo-5/lib/fallback-deps-test-repo-6/lib')) === false, './clones/repo4/lib/fallback-deps-test-repo-5/lib/fallback-deps-test-repo-6/lib does exist')
  })

  it('Testing if `fallback-dependencies` still works if the repo is not a direct dependency of the root project, append the `:directOnly`', function () {
    assert(fs.existsSync(path.join(__dirname, './clones/repo7/lib')) === true, './clones/repo7/lib does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo7/lib/fallback-deps-test-repo-8')) === true, './clones/repo7/lib/fallback-deps-test-repo-8 does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo7/lib/fallback-deps-test-repo-8/lib')) === true, './clones/repo7/lib/fallback-deps-test-repo-8/lib does not exist')
  })

  it('Testing if `fallback-dependencies` still works if the repo already exists', function () {
    assert(fs.existsSync(path.join(__dirname, './clones/repo10/lib')) === true, './clones/repo10/lib does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo10/lib/fallback-deps-test-repo-11')) === true, './clones/repo10/lib/fallback-deps-test-repo-11 does not exist')
  })

  it('Testing if `fallback-dependencies` still works if there is a git pull error!', function () {
    assert(fs.existsSync(path.join(__dirname, './clones/repo13/lib')) === true, './clones/repo13/lib does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo13/lib/fallback-deps-test-repo-28')) === true, './clones/repo13/lib/fallback-deps-test-repo-28 does not exist')
  })

  it('Testing if skip installing dependencies for a specific fallback-dependency by using ` -skip-deps` works', function () {
    assert(fs.existsSync(path.join(__dirname, './clones/repo16/lib')) === true, './clones/repo16/lib does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo16/lib/fallback-deps-test-repo-17')) === true, './clones/repo16/lib/fallback-deps-test-repo-17 does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo16/lib/fallback-deps-test-repo-17/.git')) === true, './clones/repo16/lib/fallback-deps-test-repo-17/.git does not exist')
  })

  it('Checking to see if  cloneing a specific git tag by using add `-b tag_name` works', function () {
    assert(fs.existsSync(path.join(__dirname, './clones/repo19/lib')) === true, './clones/repo19/lib does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo19/lib/fallback-deps-test-repo-20')) === true, './clones/repo19/lib/fallback-deps-test-repo-20 does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo19/lib/fallback-deps-test-repo-20/.git')) === true, './clones/repo19/lib/fallback-deps-test-repo-20/.git does not exist')
  })

  it('Testing if `fallback-dependencies` does not update if  repos is not a git repo', function () {
    assert(fs.existsSync(path.join(__dirname, './clones/repo25/lib')) === true, './clones/repo25/lib does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo25/lib/fallback-deps-test-repo-26')) === true, './clones/repo19/lib/fallback-deps-test-repo-20 does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo25/lib/fallback-deps-test-repo-26/.git/config')) === false, './clones/repo25/lib/fallback-deps-test-repo-26/.git/config does exist')
  })
})
