/* eslint-env mocha */
const assert = require('assert')
const cleanupTestApp = require('./util/cleanupTestApp')

const path = require('path')
const appDir = path.join(__dirname, 'app/paramFunctionTest')
const basicFallbackDependencies = path.join(__dirname, './util/basicFallbackDependencies.js')
const reposFileInUse = path.join(__dirname, './util/reposFileInUse.js')
const appendingDirectOnly = path.join(__dirname, './util/appendingDirectOnly.js')
const ifRepoAlreadyExists = path.join(__dirname, './util/ifRepoAlreadyExists.js')
const createGitPullRrror = path.join(__dirname, './util/createGitPullRrror.js')
const specificFallbackDependency = path.join(__dirname, './util/specificFallbackDependency.js')
const cloneingSpecificGitTag = path.join(__dirname, './util/cloneingSpecificGitTag.js')
const desiredVersion = path.join(__dirname, './util/desiredVersion.js')
const notAGitRepo = path.join(__dirname, './util/notAGitRepo.js')

const fs = require('fs')

describe('Testing script fallbackDep.js', function () {
  before(function (done) {
    // Run fallback dependancy script
    cleanupTestApp(appDir, (err) => {
      if (err) {
        throw err
      } else {
        done()
      }
    })
  })
  // delete the test app Directory and start with a clean state after each test
  after(function (done) {
    //  Delete repos and clones file after running test
    fs.rmSync(path.normalize('./test/clones'), { recursive: true, force: true })
    fs.rmSync(path.normalize('./test/repos'), { recursive: true, force: true })

    cleanupTestApp(appDir, (err) => {
      if (err) {
        throw err
      } else {
        done()
      }
    })
  })

  it('Testing if `fallback-dependencies`  works and creates all files intended', function () {
    require(basicFallbackDependencies)()
    require(desiredVersion)()
    assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib')) === true, './clones/repo1/lib does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2')) === true, './clones/repo1/lib/fallback-deps-test-repo-2 does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/lib')) === true, './clones/repo1/lib/fallback-deps-test-repo-2/lib does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3')) === true, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3 does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/package-lock.json')) === true, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/package-lock.json does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/package.json')) === true, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/package.json does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/lib')) === false, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/lib does not exist')
  })

  it('Testing if `fallback-dependencies` still works if repos is non-presence and replaced with reposFile', function () {
    require(reposFileInUse)()
    assert(fs.existsSync(path.join(__dirname, './clones/repo4/lib')) === true, './clones/repo4/lib does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo4/lib/fallback-deps-test-repo-5')) === true, './clones/repo4/lib/fallback-deps-test-repo-5 does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo4/lib/fallback-deps-test-repo-5/lib')) === true, './clones/repo4/lib/fallback-deps-test-repo-5/lib does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo4/lib/fallback-deps-test-repo-5/lib/fallback-deps-test-repo-6')) === true, './clones/repo4/lib/fallback-deps-test-repo-5/lib/fallback-deps-test-repo-6 does exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo4/lib/fallback-deps-test-repo-5/lib/fallback-deps-test-repo-6/package-lock.json')) === true, './clones/repo4/lib/fallback-deps-test-repo-5/lib/fallback-deps-test-repo-6/package-lock.json does exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo4/lib/fallback-deps-test-repo-5/lib/fallback-deps-test-repo-6/package.json')) === true, './clones/repo4/lib/fallback-deps-test-repo-5/lib/fallback-deps-test-repo-6/package.json does exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo4/lib/fallback-deps-test-repo-5/lib/fallback-deps-test-repo-6/lib')) === false, './clones/repo4/lib/fallback-deps-test-repo-5/lib/fallback-deps-test-repo-6/lib does exist')
  })

  it('Testing if `fallback-dependencies` still works if the repo is not a direct dependency of the root project, append the `:directOnly`', function () {
    require(appendingDirectOnly)()
    assert(fs.existsSync(path.join(__dirname, './clones/repo7/lib')) === true, './clones/repo7/lib does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo7/lib/fallback-deps-test-repo-8')) === true, './clones/repo7/lib/fallback-deps-test-repo-8 does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo7/lib/fallback-deps-test-repo-8/lib')) === true, './clones/repo7/lib/fallback-deps-test-repo-8/lib does not exist')
  })

  it('Testing if `fallback-dependencies` still works if the repo already exists', function () {
    require(ifRepoAlreadyExists)()
    assert(fs.existsSync(path.join(__dirname, './clones/repo10/lib')) === true, './clones/repo10/lib does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo10/lib/fallback-deps-test-repo-11')) === true, './clones/repo10/lib/fallback-deps-test-repo-11 does not exist')
  })

  it('Testing if `fallback-dependencies` still works if there is a git pull error!', function () {
    require(createGitPullRrror)()
    assert(fs.existsSync(path.join(__dirname, './clones/repo13/lib')) === true, './clones/repo13/lib does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo13/lib/fallback-deps-test-repo-28')) === true, './clones/repo13/lib/fallback-deps-test-repo-28 does not exist')
  })

  it('Testing if skip installing dependencies for a specific fallback-dependency by using ` -skip-deps` works', function () {
    require(specificFallbackDependency)()
    assert(fs.existsSync(path.join(__dirname, './clones/repo16/lib')) === true, './clones/repo16/lib does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo16/lib/fallback-deps-test-repo-17')) === true, './clones/repo16/lib/fallback-deps-test-repo-17 does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo16/lib/fallback-deps-test-repo-17/.git')) === true, './clones/repo16/lib/fallback-deps-test-repo-17/.git does not exist')
  })

  it('Checking to see if  cloneing a specific git tag by using add `-b tag_name` works', function () {
    require(cloneingSpecificGitTag)()
    assert(fs.existsSync(path.join(__dirname, './clones/repo19/lib')) === true, './clones/repo19/lib does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo19/lib/fallback-deps-test-repo-20')) === true, './clones/repo19/lib/fallback-deps-test-repo-20 does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo19/lib/fallback-deps-test-repo-20/.git')) === true, './clones/repo19/lib/fallback-deps-test-repo-20/.git does not exist')
  })

  it('Testing if `fallback-dependencies` does not update if  repos is not a git repo', function () {
    require(notAGitRepo)()
    assert(fs.existsSync(path.join(__dirname, './clones/repo25/lib')) === true, './clones/repo25/lib does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo25/lib/fallback-deps-test-repo-26')) === true, './clones/repo19/lib/fallback-deps-test-repo-20 does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo25/lib/fallback-deps-test-repo-26/.git')) === false, './clones/repo25/lib/fallback-deps-test-repo-26/.git does exist')
  })
})
