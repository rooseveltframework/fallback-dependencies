/* eslint-env mocha */
const assert = require('assert')
const fs = require('fs')
const path = require('path')
const appendingDirectOnly = path.join(__dirname, './util/appendingDirectOnly.js')
const basicFallbackDependencies = path.join(__dirname, './util/basicFallbackDependencies.js')
const cloningNonTaggedCommit = path.join(__dirname, './util/cloningNonTaggedCommit.js')
const cloningSpecificGitTag = path.join(__dirname, './util/cloningSpecificGitTag.js')
const createGitPullError = path.join(__dirname, './util/createGitPullError.js')
const desiredVersion = path.join(__dirname, './util/desiredVersion.js')
const domainOverride = path.join(__dirname, './util/domainOverride.js')
const failedToClone = path.join(__dirname, './util/failedToClone')
const failedToUpdate = path.join(__dirname, './util/failedToUpdate.js')
const gitError = path.join(__dirname, './util/gitError.js')
const ifRepoAlreadyExists = path.join(__dirname, './util/ifRepoAlreadyExists.js')
const notGitRepo = path.join(__dirname, './util/notGitRepo.js')
const pullFromBranchName = path.join(__dirname, './util/pullFromBranchName.js')
const pullFromNonTaggedCommit = path.join(__dirname, './util/pullFromNonTaggedCommit.js')
const reposFileInUse = path.join(__dirname, './util/reposFileInUse.js')
const specificFallbackDependency = path.join(__dirname, './util/specificFallbackDependency.js')
process.env.FALLBACK_DEPENDENCIES_REMOVE_STALE_DIRECTORIES = true // disable "remove stale directories" prompt

afterEach(done => {
  fs.rmSync(path.join(__dirname, './clones'), { recursive: true, force: true })
  fs.rmSync(path.join(__dirname, './repos'), { recursive: true, force: true })
  done()
})

// clean up files on ctrl + c
process.on('SIGINT', () => {
  fs.rmSync(path.join(__dirname, './clones'), { recursive: true, force: true })
  fs.rmSync(path.join(__dirname, './repos'), { recursive: true, force: true })
  delete process.env.FALLBACK_DEPENDENCIES_PREFERRED_WILDCARD
  process.exit()
})

describe('universal fallback-dependencies tests', () => {
  it('should create all files intended', () => {
    const listTypes = ['fallbackDependencies', 'fallbackDevDependencies']
    while (listTypes.length) {
      fs.rmSync(path.join(__dirname, './clones'), { recursive: true, force: true })
      fs.rmSync(path.join(__dirname, './repos'), { recursive: true, force: true })
      require(basicFallbackDependencies)(listTypes.pop())
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib')), './clones/repo1/lib does not exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2')), './clones/repo1/lib/fallback-deps-test-repo-2 does not exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/lib')), './clones/repo1/lib/fallback-deps-test-repo-2/lib does not exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3')), './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3 does not exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/package-lock.json')), './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/package-lock.json does not exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/package.json')), './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/package.json does not exist')
    }
  })

  it('should create intended files using reposFile feature', () => {
    const listTypes = ['fallbackDependencies', 'fallbackDevDependencies']
    while (listTypes.length) {
      fs.rmSync(path.join(__dirname, './clones'), { recursive: true, force: true })
      fs.rmSync(path.join(__dirname, './repos'), { recursive: true, force: true })
      require(reposFileInUse)(listTypes.pop())
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib')), './clones/repo1/lib does not exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2')) === true, './clones/repo1/lib/fallback-deps-test-repo-2 does not exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/lib')) === true, './clones/repo1/lib/fallback-deps-test-repo-2/lib does not exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3')), './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3 does exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/package-lock.json')), './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/package-lock.json does exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/package.json')), './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/package.json does exist')
    }
  })

  it('should still work if the repo already exists', () => {
    const listTypes = ['fallbackDependencies', 'fallbackDevDependencies']
    while (listTypes.length) {
      fs.rmSync(path.join(__dirname, './clones'), { recursive: true, force: true })
      fs.rmSync(path.join(__dirname, './repos'), { recursive: true, force: true })
      require(ifRepoAlreadyExists)(listTypes.pop())
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib')), './clones/repo1/lib does not exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2')), './clones/repo1/lib/fallback-deps-test-repo-2 does not exist')
    }
  })

  it('should skip installing dependencies for a specific fallback-dependency if the -skip-deps feature is present', () => {
    const listTypes = ['fallbackDependencies', 'fallbackDevDependencies']
    while (listTypes.length) {
      fs.rmSync(path.join(__dirname, './clones'), { recursive: true, force: true })
      fs.rmSync(path.join(__dirname, './repos'), { recursive: true, force: true })
      require(specificFallbackDependency)(listTypes.pop())
      assert(!fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/node_modules')), './clones/repo1/lib/fallback-deps-test-repo-2/node_modules does exist')
    }
  })

  it('should clone a specific git tag by using add -b tag_name feature', () => {
    const listTypes = ['fallbackDependencies', 'fallbackDevDependencies']
    while (listTypes.length) {
      fs.rmSync(path.join(__dirname, './clones'), { recursive: true, force: true })
      fs.rmSync(path.join(__dirname, './repos'), { recursive: true, force: true })
      require(cloningSpecificGitTag)(listTypes.pop())
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib')), './clones/repo1/lib does not exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2')), './clones/repo1/lib/fallback-deps-test-repo-2 does not exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/.git')), './clones/repo1/lib/fallback-deps-test-repo-2/.git does not exist')
    }
  })

  it('should clone a non-tagged commit by using add -b tag_name feature', () => {
    process.env.FALLBACK_DEPENDENCIES_NPM_CI_ARGS = '--no-audit' // covers line 256
    const listTypes = ['fallbackDependencies', 'fallbackDevDependencies']
    while (listTypes.length) {
      fs.rmSync(path.join(__dirname, './clones'), { recursive: true, force: true })
      fs.rmSync(path.join(__dirname, './repos'), { recursive: true, force: true })
      require(cloningNonTaggedCommit)(listTypes.pop())
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib')), './clones/repo1/lib does not exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2')), './clones/repo1/lib/fallback-deps-test-repo-2 does not exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/.git')), './clones/repo1/lib/fallback-deps-test-repo-2/.git does not exist')
    }
    delete process.env.FALLBACK_DEPENDENCIES_NPM_CI_ARGS // remove env var for remaining tests
  })

  it('should checkout desired -b version number', () => {
    const listTypes = ['fallbackDependencies', 'fallbackDevDependencies']
    while (listTypes.length) {
      fs.rmSync(path.join(__dirname, './clones'), { recursive: true, force: true })
      fs.rmSync(path.join(__dirname, './repos'), { recursive: true, force: true })
      require(desiredVersion)(listTypes.pop())
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib')), './clones/repo1/lib does not exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2')), './clones/repo1/lib/fallback-deps-test-repo-2 does not exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/.git')), './clones/repo1/lib/fallback-deps-test-repo-2/.git does not exist')
    }
  })

  it('should pull from a non-tagged commit', () => {
    const listTypes = ['fallbackDependencies', 'fallbackDevDependencies']
    while (listTypes.length) {
      fs.rmSync(path.join(__dirname, './clones'), { recursive: true, force: true })
      fs.rmSync(path.join(__dirname, './repos'), { recursive: true, force: true })
      require(pullFromNonTaggedCommit)(listTypes.pop())
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib')), './clones/repo1/lib does not exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2')), './clones/repo1/lib/fallback-deps-test-repo-2 does not exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/.git')), './clones/repo1/lib/fallback-deps-test-repo-2/.git does not exist')
    }
  })

  it('should pull from a branch', () => {
    const listTypes = ['fallbackDependencies', 'fallbackDevDependencies']
    while (listTypes.length) {
      fs.rmSync(path.join(__dirname, './clones'), { recursive: true, force: true })
      fs.rmSync(path.join(__dirname, './repos'), { recursive: true, force: true })
      require(pullFromBranchName)(listTypes.pop())
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib')), './clones/repo1/lib does not exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2')), './clones/repo1/lib/fallback-deps-test-repo-2 does not exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/.git')), './clones/repo1/lib/fallback-deps-test-repo-2/.git does not exist')
    }
  })

  it('should skip any folder that is not a git repo', () => {
    const listTypes = ['fallbackDependencies', 'fallbackDevDependencies']
    while (listTypes.length) {
      fs.rmSync(path.join(__dirname, './clones'), { recursive: true, force: true })
      fs.rmSync(path.join(__dirname, './repos'), { recursive: true, force: true })
      require(notGitRepo)(listTypes.pop())
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib')), './clones/repo1/lib does not exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2')), './clones/repo1/lib/fallback-deps-test-repo-2 does not exist')
      assert(!fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/.git')), './clones/repo1/lib/fallback-deps-test-repo-2/.git does exist')
    }
  })

  it('should source the second fallback-dependency URL on the list first if FALLBACK_DEPENDENCIES_PREFERRED_WILDCARD favors it', () => {
    process.env.FALLBACK_DEPENDENCIES_PREFERRED_WILDCARD = 'repo3'
    const listTypes = ['fallbackDependencies', 'fallbackDevDependencies']
    while (listTypes.length) {
      fs.rmSync(path.join(__dirname, './clones'), { recursive: true, force: true })
      fs.rmSync(path.join(__dirname, './repos'), { recursive: true, force: true })
      require(domainOverride)(listTypes.pop())
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib')), './clones/repo1/lib does not exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2')), './clones/repo1/lib/fallback-deps-test-repo-2 does not exist')
      assert(!fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/lib')), './clones/repo1/lib/fallback-deps-test-repo-2/lib does exist')
      assert(!fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3')), './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3 does exist')
      assert(!fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/package-lock.json')), './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/package-lock.json does exist')
      assert(!fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/package.json')), './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/package.json does exist')
    }
    delete process.env.FALLBACK_DEPENDENCIES_PREFERRED_WILDCARD
  })

  it('should run fallback dependencies with "remove stale directories" prompt enabled', () => {
    delete process.env.FALLBACK_DEPENDENCIES_REMOVE_STALE_DIRECTORIES
    const listTypes = ['fallbackDependencies', 'fallbackDevDependencies']
    while (listTypes.length) {
      fs.rmSync(path.join(__dirname, './clones'), { recursive: true, force: true })
      fs.rmSync(path.join(__dirname, './repos'), { recursive: true, force: true })
      require(basicFallbackDependencies)(listTypes.pop())
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib')), './clones/repo1/lib does not exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2')), './clones/repo1/lib/fallback-deps-test-repo-2 does not exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/lib')), './clones/repo1/lib/fallback-deps-test-repo-2/lib does not exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3')), './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3 does not exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/package-lock.json')), './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/package-lock.json does not exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/package.json')), './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/package.json does not exist')
    }
    process.env.FALLBACK_DEPENDENCIES_REMOVE_STALE_DIRECTORIES = true // set env var back for remaining tests
  })

  it('should exit gracefully due to git not being installed', () => {
    const pathEnv = process.env.PATH
    const output = require(gitError)('fallbackDependencies')
    assert(output.includes('git process failed with code -2'), 'git process did not fail')
    process.env.PATH = pathEnv // reset PATH for rest of tests
  })

  it('should fail gracefully if there is a git pull error', () => {
    const listTypes = ['fallbackDependencies', 'fallbackDevDependencies']
    while (listTypes.length) {
      fs.rmSync(path.join(__dirname, './clones'), { recursive: true, force: true })
      fs.rmSync(path.join(__dirname, './repos'), { recursive: true, force: true })
      const output = require(createGitPullError)(listTypes.pop())
      assert(output.includes('git pull error'), 'git pull was successful')
    }
  })

  it('should trigger "cannnot update dependency" error', () => {
    fs.rmSync(path.join(__dirname, './clones'), { recursive: true, force: true })
    fs.rmSync(path.join(__dirname, './repos'), { recursive: true, force: true })
    const output = require(failedToUpdate)('fallbackDependencies')
    assert(output.includes('Cannot update lib/fallback-deps-test-repo-2'), 'lib/fallback-deps-test-repo-2 has been updated')
  })

  it('should fail to clone fallbacks', () => {
    fs.rmSync(path.join(__dirname, './clones'), { recursive: true, force: true })
    fs.rmSync(path.join(__dirname, './repos'), { recursive: true, force: true })
    require(failedToClone)('fallbackDependencies')
    assert(!fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2')), './clones/repo1/lib/fallback-deps-test-repo-2 does exist')
  })
})

describe('fallbackDevDependencies-exclusive tests', () => {
  it('should create intended files using directOnly feature', () => {
    fs.rmSync(path.join(__dirname, './clones'), { recursive: true, force: true })
    fs.rmSync(path.join(__dirname, './repos'), { recursive: true, force: true })
    require(appendingDirectOnly)()
    assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib')), './clones/repo1/lib does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2')), './clones/repo1/lib/fallback-deps-test-repo-2 does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/lib')), './clones/repo1/lib/fallback-deps-test-repo-2/lib does not exist')
  })
})
