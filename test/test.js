/* eslint-env mocha */
const assert = require('assert')

const path = require('path')
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
  this.beforeEach(function (done) {
    fs.rmSync(path.join(__dirname, './clones'), { recursive: true, force: true })
    fs.rmSync(path.join(__dirname, './repos'), { recursive: true, force: true })
    done()
  })
  // delete the test app Directory and start with a clean state after each test
  after(function (done) {
    fs.rmSync(path.join(__dirname, './clones'), { recursive: true, force: true })
    fs.rmSync(path.join(__dirname, './repos'), { recursive: true, force: true })
    done()
  })

  it('should create all files intended', function () {
    require(basicFallbackDependencies)()
    assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib')) === true, './clones/repo1/lib does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2')) === true, './clones/repo1/lib/fallback-deps-test-repo-2 does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/lib')) === true, './clones/repo1/lib/fallback-deps-test-repo-2/lib does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3')) === true, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3 does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/package-lock.json')) === true, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/package-lock.json does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/package.json')) === true, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/package.json does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/lib')) === false, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/lib does not exist')
  })

  it('should create intended files using reposFile feature', function () {
    require(reposFileInUse)()
    assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib')) === true, './clones/repo1/lib does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2')) === true, './clones/repo1/lib/fallback-deps-test-repo-2 does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/lib')) === true, './clones/repo1/lib/fallback-deps-test-repo-2/lib does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3')) === true, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3 does exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/package-lock.json')) === true, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/package-lock.json does exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/package.json')) === true, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/package.json does exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/lib')) === false, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/lib does exist')
  })

  it('should create intended files using directOnly feature', function () {
    require(appendingDirectOnly)()
    assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib')) === true, './clones/repo1/lib does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2')) === true, './clones/repo1/lib/fallback-deps-test-repo-2 does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/lib')) === true, './clones/repo1/lib/fallback-deps-test-repo-2/lib does not exist')
  })

  it('should still work if the repo already exists', function () {
    require(ifRepoAlreadyExists)()
    assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib')) === true, './clones/repo1/lib does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2')) === true, './clones/repo1/lib/fallback-deps-test-repo-2 does not exist')
  })

  it('should fail gracefully if there is a git pull error', function () {
    require(createGitPullRrror)()
    assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib')) === true, './clones/repo1/lib does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-4')) === true, './clones/repo1/lib/fallback-deps-test-repo-4 does not exist')
  })

  it('should skip installing dependencies for a specific fallback-dependency if the -skip-deps feature is present', function () {
    require(specificFallbackDependency)()
    assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib')) === true, './clones/repo1/lib does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2')) === true, './clones/repo1/lib/fallback-deps-test-repo-2 does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/.git')) === true, './clones/repo1/lib/fallback-deps-test-repo-2/.git does not exist')
  })

  it('should clone a specific git tag by using add -b tag_name feature', function () {
    require(cloneingSpecificGitTag)()
    assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib')) === true, './clones/repo1/lib does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2')) === true, './clones/repo1/lib/fallback-deps-test-repo-2 does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/.git')) === true, './clones/repo1/lib/fallback-deps-test-repo-2/.git does not exist')
  })

  it('should re-clone the repo if the tag does not match the desired -b version number', function () {
    require(desiredVersion)()
    assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib')) === true, './clones/repo1/lib does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2')) === true, './clones/repo1/lib/fallback-deps-test-repo-2 does not exist')
  })

  it('should skip any folder that is not a git repo', function () {
    require(notAGitRepo)()
    assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib')) === true, './clones/repo1/lib does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2')) === true, './clones/repo1/lib/fallback-deps-test-repo-2 does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/.git')) === false, './clones/repo1/lib/fallback-deps-test-repo-2/.git does exist')
  })
})
