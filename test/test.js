/* eslint-env mocha */
const assert = require('assert')
const fs = require('fs')
const path = require('path')
const appendingDirectOnly = path.join(__dirname, './util/appendingDirectOnly.js')
const basicFallbackDependencies = path.join(__dirname, './util/basicFallbackDependencies.js')
const cloningSpecificGitTag = path.join(__dirname, './util/cloningSpecificGitTag.js')
const createGitPullError = path.join(__dirname, './util/createGitPullError.js')
const desiredVersion = path.join(__dirname, './util/desiredVersion.js')
const domainOverride = path.join(__dirname, './util/domainOverride.js')
const ifRepoAlreadyExists = path.join(__dirname, './util/ifRepoAlreadyExists.js')
const notGitRepo = path.join(__dirname, './util/notGitRepo.js')
const reposFileInUse = path.join(__dirname, './util/reposFileInUse.js')
const specificFallbackDependency = path.join(__dirname, './util/specificFallbackDependency.js')

describe('universal fallback-dependencies tests', () => {
  afterEach(done => {
    fs.rmSync(path.join(__dirname, './clones'), { recursive: true, force: true })
    fs.rmSync(path.join(__dirname, './repos'), { recursive: true, force: true })
    delete process.env.FALLBACK_DEPENDENCIES_PREFERRED_WILDCARD
    done()
  })

  it('should create all files intended', () => {
    const listTypes = ['fallbackDependencies', 'fallbackDevDependencies']
    while (listTypes.length) {
      fs.rmSync(path.join(__dirname, './clones'), { recursive: true, force: true })
      fs.rmSync(path.join(__dirname, './repos'), { recursive: true, force: true })
      require(basicFallbackDependencies)(listTypes.pop())
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib')) === true, './clones/repo1/lib does not exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2')) === true, './clones/repo1/lib/fallback-deps-test-repo-2 does not exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/lib')) === true, './clones/repo1/lib/fallback-deps-test-repo-2/lib does not exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3')) === true, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3 does not exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/package-lock.json')) === true, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/package-lock.json does not exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/package.json')) === true, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/package.json does not exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/lib')) === false, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/lib does not exist')
    }
  })

  it('should create intended files using reposFile feature', () => {
    const listTypes = ['fallbackDependencies', 'fallbackDevDependencies']
    while (listTypes.length) {
      fs.rmSync(path.join(__dirname, './clones'), { recursive: true, force: true })
      fs.rmSync(path.join(__dirname, './repos'), { recursive: true, force: true })
      require(reposFileInUse)(listTypes.pop())
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib')) === true, './clones/repo1/lib does not exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2')) === true, './clones/repo1/lib/fallback-deps-test-repo-2 does not exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/lib')) === true, './clones/repo1/lib/fallback-deps-test-repo-2/lib does not exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3')) === true, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3 does exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/package-lock.json')) === true, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/package-lock.json does exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/package.json')) === true, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/package.json does exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/lib')) === false, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/lib does exist')
    }
  })

  it('should still work if the repo already exists', () => {
    const listTypes = ['fallbackDependencies', 'fallbackDevDependencies']
    while (listTypes.length) {
      fs.rmSync(path.join(__dirname, './clones'), { recursive: true, force: true })
      fs.rmSync(path.join(__dirname, './repos'), { recursive: true, force: true })
      require(ifRepoAlreadyExists)(listTypes.pop())
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib')) === true, './clones/repo1/lib does not exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2')) === true, './clones/repo1/lib/fallback-deps-test-repo-2 does not exist')
    }
  })

  it('should fail gracefully if there is a git pull error', () => {
    const listTypes = ['fallbackDependencies', 'fallbackDevDependencies']
    while (listTypes.length) {
      fs.rmSync(path.join(__dirname, './clones'), { recursive: true, force: true })
      fs.rmSync(path.join(__dirname, './repos'), { recursive: true, force: true })
      require(createGitPullError)(listTypes.pop())
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib')) === true, './clones/repo1/lib does not exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-4')) === true, './clones/repo1/lib/fallback-deps-test-repo-4 does not exist')
    }
  })

  it('should skip installing dependencies for a specific fallback-dependency if the -skip-deps feature is present', () => {
    const listTypes = ['fallbackDependencies', 'fallbackDevDependencies']
    while (listTypes.length) {
      fs.rmSync(path.join(__dirname, './clones'), { recursive: true, force: true })
      fs.rmSync(path.join(__dirname, './repos'), { recursive: true, force: true })
      require(specificFallbackDependency)(listTypes.pop())
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib')) === true, './clones/repo1/lib does not exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2')) === true, './clones/repo1/lib/fallback-deps-test-repo-2 does not exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/.git')) === true, './clones/repo1/lib/fallback-deps-test-repo-2/.git does not exist')
    }
  })

  it('should clone a specific git tag by using add -b tag_name feature', () => {
    const listTypes = ['fallbackDependencies', 'fallbackDevDependencies']
    while (listTypes.length) {
      fs.rmSync(path.join(__dirname, './clones'), { recursive: true, force: true })
      fs.rmSync(path.join(__dirname, './repos'), { recursive: true, force: true })
      require(cloningSpecificGitTag)(listTypes.pop())
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib')) === true, './clones/repo1/lib does not exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2')) === true, './clones/repo1/lib/fallback-deps-test-repo-2 does not exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/.git')) === true, './clones/repo1/lib/fallback-deps-test-repo-2/.git does not exist')
    }
  })

  it('should re-clone the repo if the tag does not match the desired -b version number', () => {
    const listTypes = ['fallbackDependencies', 'fallbackDevDependencies']
    while (listTypes.length) {
      fs.rmSync(path.join(__dirname, './clones'), { recursive: true, force: true })
      fs.rmSync(path.join(__dirname, './repos'), { recursive: true, force: true })
      require(desiredVersion)(listTypes.pop())
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib')) === true, './clones/repo1/lib does not exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2')) === true, './clones/repo1/lib/fallback-deps-test-repo-2 does not exist')
    }
  })

  it('should skip any folder that is not a git repo', () => {
    const listTypes = ['fallbackDependencies', 'fallbackDevDependencies']
    while (listTypes.length) {
      fs.rmSync(path.join(__dirname, './clones'), { recursive: true, force: true })
      fs.rmSync(path.join(__dirname, './repos'), { recursive: true, force: true })
      require(notGitRepo)(listTypes.pop())
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib')) === true, './clones/repo1/lib does not exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2')) === true, './clones/repo1/lib/fallback-deps-test-repo-2 does not exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/.git')) === false, './clones/repo1/lib/fallback-deps-test-repo-2/.git does exist')
    }
  })

  it('should source the second fallback-dependency URL on the list first if FALLBACK_DEPENDENCIES_PREFERRED_WILDCARD favors it', () => {
    process.env.FALLBACK_DEPENDENCIES_PREFERRED_WILDCARD = 'repo3'
    const listTypes = ['fallbackDependencies', 'fallbackDevDependencies']
    while (listTypes.length) {
      fs.rmSync(path.join(__dirname, './clones'), { recursive: true, force: true })
      fs.rmSync(path.join(__dirname, './repos'), { recursive: true, force: true })
      require(domainOverride)(listTypes.pop())
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib')) === true, './clones/repo1/lib does not exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2')) === true, './clones/repo1/lib/fallback-deps-test-repo-2 does not exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/lib')) === false, './clones/repo1/lib/fallback-deps-test-repo-2/lib should not exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3')) === false, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3 should not exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/package-lock.json')) === false, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/package-lock.json should not exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/package.json')) === false, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/package.json should not exist')
    }
  })
})

describe('fallbackDevDependencies-exclusive tests', () => {
  afterEach(done => {
    fs.rmSync(path.join(__dirname, './clones'), { recursive: true, force: true })
    fs.rmSync(path.join(__dirname, './repos'), { recursive: true, force: true })
    delete process.env.FALLBACK_DEPENDENCIES_PREFERRED_WILDCARD
    done()
  })

  it('should create intended files using directOnly feature', () => {
    fs.rmSync(path.join(__dirname, './clones'), { recursive: true, force: true })
    fs.rmSync(path.join(__dirname, './repos'), { recursive: true, force: true })
    require(appendingDirectOnly)()
    assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib')) === true, './clones/repo1/lib does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2')) === true, './clones/repo1/lib/fallback-deps-test-repo-2 does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/lib')) === true, './clones/repo1/lib/fallback-deps-test-repo-2/lib does not exist')
  })
})

describe('fallbackDependencies-exclusive tests', () => {
  afterEach(done => {
    fs.rmSync(path.join(__dirname, './clones'), { recursive: true, force: true })
    fs.rmSync(path.join(__dirname, './repos'), { recursive: true, force: true })
    delete process.env.FALLBACK_DEPENDENCIES_PREFERRED_WILDCARD
    done()
  })
})
