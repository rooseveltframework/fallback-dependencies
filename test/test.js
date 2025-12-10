/* eslint-env mocha */
const assert = require('assert')
const childProcess = require('child_process')
const fs = require('fs')
const path = require('path')
const appendingDirectOnly = path.join(__dirname, './util/appendingDirectOnly.js')
const basicFallbackDependencies = path.join(__dirname, './util/basicFallbackDependencies.js')
const branchUpToDate = path.join(__dirname, './util/branchUpToDate.js')
const checkoutNonTaggedCommit = path.join(__dirname, './util/checkoutNonTaggedCommit.js')
const checkoutHeadBranch = path.join(__dirname, './util/checkoutHeadBranch.js')
const cloningNonTaggedCommit = path.join(__dirname, './util/cloningNonTaggedCommit.js')
const cloningSpecificGitTag = path.join(__dirname, './util/cloningSpecificGitTag.js')
const desiredVersion = path.join(__dirname, './util/desiredVersion.js')
const domainOverride = path.join(__dirname, './util/domainOverride.js')
const failedToClone = path.join(__dirname, './util/failedToClone')
const failedToCloneVersion = path.join(__dirname, './util/failedToCloneVersion')
const gitCheckoutTagError = path.join(__dirname, './util/gitCheckoutTagError.js')
const gitCheckoutCommitError = path.join(__dirname, './util/gitCheckoutCommitError.js')
const gitCloneCheckoutError = path.join(__dirname, './util/gitCloneCheckoutError.js')
const gitError = path.join(__dirname, './util/gitError.js')
const gitFetchHeadError = path.join(__dirname, './util/gitFetchHeadError.js')
const gitFetchTagsError = path.join(__dirname, './util/gitFetchTagsError.js')
const gitFetchRemoteError = path.join(__dirname, './util/gitFetchRemoteError.js')
const gitPullRemoteBranchError = path.join(__dirname, './util/gitPullRemoteBranchError.js')
const gitTagError = path.join(__dirname, './util/gitTagError.js')
const ifRepoAlreadyExists = path.join(__dirname, './util/ifRepoAlreadyExists.js')
const notGitRepo = path.join(__dirname, './util/notGitRepo.js')
const pullFromBranchName = path.join(__dirname, './util/pullFromBranchName.js')
const pullFromNonTaggedCommit = path.join(__dirname, './util/pullFromNonTaggedCommit.js')
const reCloneRepo = path.join(__dirname, './util/reCloneRepo.js')
const reCloneRepoWithBranch = path.join(__dirname, './util/reCloneRepoWithBranch.js')
const reCloneRepoWithCommitId = path.join(__dirname, './util/reCloneRepoWithCommitId.js')
const reposFileInUse = path.join(__dirname, './util/reposFileInUse.js')
const repoUpToDateWithCommitId = path.join(__dirname, './util/repoUpToDateWithCommitId.js')
const specificFallbackDependency = path.join(__dirname, './util/specificFallbackDependency.js')
process.env.FALLBACK_DEPENDENCIES_REMOVE_STALE_DIRECTORIES = true

afterEach(done => {
  fs.rmSync(path.join(__dirname, './clones'), { recursive: true, force: true })
  fs.rmSync(path.join(__dirname, './repos'), { recursive: true, force: true })
  done()
})

// clean up files on ctrl + c
process.on('SIGINT', () => {
  fs.rmSync(path.join(__dirname, './clones'), { recursive: true, force: true })
  fs.rmSync(path.join(__dirname, './repos'), { recursive: true, force: true })
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

  it('should checkout head branch if url supplied doesn\'t specify -b version', () => {
    process.env.FALLBACK_DEPENDENCIES_ENABLE_CHECKOUT = true
    const listTypes = ['fallbackDependencies', 'fallbackDevDependencies']
    while (listTypes.length) {
      fs.rmSync(path.join(__dirname, './clones'), { recursive: true, force: true })
      fs.rmSync(path.join(__dirname, './repos'), { recursive: true, force: true })
      require(checkoutHeadBranch)(listTypes.pop())
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib')), './clones/repo1/lib does not exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2')), './clones/repo1/lib/fallback-deps-test-repo-2 does not exist')
    }
    delete process.env.FALLBACK_DEPENDENCIES_ENABLE_CHECKOUT
  })

  it('should checkout desired -b version number', () => {
    process.env.FALLBACK_DEPENDENCIES_ENABLE_CHECKOUT = true
    const listTypes = ['fallbackDependencies', 'fallbackDevDependencies']
    while (listTypes.length) {
      fs.rmSync(path.join(__dirname, './clones'), { recursive: true, force: true })
      fs.rmSync(path.join(__dirname, './repos'), { recursive: true, force: true })
      require(desiredVersion)(listTypes.pop())
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib')), './clones/repo1/lib does not exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2')), './clones/repo1/lib/fallback-deps-test-repo-2 does not exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/.git')), './clones/repo1/lib/fallback-deps-test-repo-2/.git does not exist')
    }
    delete process.env.FALLBACK_DEPENDENCIES_ENABLE_CHECKOUT
  })

  it('should checkout a non-tagged commit', () => {
    const listTypes = ['fallbackDependencies', 'fallbackDevDependencies']
    while (listTypes.length) {
      fs.rmSync(path.join(__dirname, './clones'), { recursive: true, force: true })
      fs.rmSync(path.join(__dirname, './repos'), { recursive: true, force: true })
      require(checkoutNonTaggedCommit)(listTypes.pop())
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib')), './clones/repo1/lib does not exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2')), './clones/repo1/lib/fallback-deps-test-repo-2 does not exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/.git')), './clones/repo1/lib/fallback-deps-test-repo-2/.git does not exist')
    }
  })

  it('should reclone repo if desired -b version number differs from current version number', () => {
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

  it('should reclone repo if -b commit id is supplied', () => {
    const listTypes = ['fallbackDependencies', 'fallbackDevDependencies']
    while (listTypes.length) {
      fs.rmSync(path.join(__dirname, './clones'), { recursive: true, force: true })
      fs.rmSync(path.join(__dirname, './repos'), { recursive: true, force: true })
      require(reCloneRepoWithCommitId)(listTypes.pop())
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib')), './clones/repo1/lib does not exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2')), './clones/repo1/lib/fallback-deps-test-repo-2 does not exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/.git')), './clones/repo1/lib/fallback-deps-test-repo-2/.git does not exist')
    }
  })

  it('should reclone repo if -b branch is supplied', () => {
    const listTypes = ['fallbackDependencies', 'fallbackDevDependencies']
    while (listTypes.length) {
      fs.rmSync(path.join(__dirname, './clones'), { recursive: true, force: true })
      fs.rmSync(path.join(__dirname, './repos'), { recursive: true, force: true })
      require(reCloneRepoWithBranch)(listTypes.pop())
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib')), './clones/repo1/lib does not exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2')), './clones/repo1/lib/fallback-deps-test-repo-2 does not exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/.git')), './clones/repo1/lib/fallback-deps-test-repo-2/.git does not exist')
    }
  })

  it('should reclone repo when attempting to clone specific -b version and url supplied differs from previously cloned repo', () => {
    fs.rmSync(path.join(__dirname, './clones'), { recursive: true, force: true })
    fs.rmSync(path.join(__dirname, './repos'), { recursive: true, force: true })
    const output = require(reCloneRepo)('fallbackDependencies')
    assert(output.includes('It will be re-cloned'), 'repo was not successfully re-cloned')
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
    delete process.env.FALLBACK_DEPENDENCIES_REMOVE_STALE_DIRECTORIES
    const listTypes = ['fallbackDependencies', 'fallbackDevDependencies']
    while (listTypes.length) {
      fs.rmSync(path.join(__dirname, './clones'), { recursive: true, force: true })
      fs.rmSync(path.join(__dirname, './repos'), { recursive: true, force: true })
      require(pullFromBranchName)(listTypes.pop())
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib')), './clones/repo1/lib does not exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2')), './clones/repo1/lib/fallback-deps-test-repo-2 does not exist')
      assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/.git')), './clones/repo1/lib/fallback-deps-test-repo-2/.git does not exist')
    }
    process.env.FALLBACK_DEPENDENCIES_REMOVE_STALE_DIRECTORIES = true
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
  })

  it('should fail to clone fallbacks when supplied url\'s with specific -b versions', () => {
    fs.rmSync(path.join(__dirname, './clones'), { recursive: true, force: true })
    fs.rmSync(path.join(__dirname, './repos'), { recursive: true, force: true })
    require(failedToCloneVersion)('fallbackDependencies')
    assert(!fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2')), './clones/repo1/lib/fallback-deps-test-repo-2 does exist')
  })

  it('should fail to clone fallbacks when supplied url\'s with no -b versions specified', () => {
    fs.rmSync(path.join(__dirname, './clones'), { recursive: true, force: true })
    fs.rmSync(path.join(__dirname, './repos'), { recursive: true, force: true })
    require(failedToClone)('fallbackDependencies')
    assert(!fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2')), './clones/repo1/lib/fallback-deps-test-repo-2 does exist')
  })

  it('should log that the repo is already up to date with the supplied -b commit id', () => {
    fs.rmSync(path.join(__dirname, './clones'), { recursive: true, force: true })
    fs.rmSync(path.join(__dirname, './repos'), { recursive: true, force: true })
    const output = require(repoUpToDateWithCommitId)('fallbackDependencies')
    assert(output.includes('Already up to date'), 'logs do not indicate that repo is up to date')
  })

  it('should log that repo is already up to date with the supplied -b branch', () => {
    fs.rmSync(path.join(__dirname, './clones'), { recursive: true, force: true })
    fs.rmSync(path.join(__dirname, './repos'), { recursive: true, force: true })
    const output = require(branchUpToDate)('fallbackDependencies')
    assert(output.includes('Already up to date'), 'logs do not indicate that repo is up to date')
  })

  it('should exit gracefully due to git not being installed', () => {
    const pathEnv = process.env.PATH
    const output = require(gitError)('fallbackDependencies')
    assert(output.includes('git process failed with code -2'), 'git process did not fail')
    process.env.PATH = pathEnv // reset PATH for rest of tests
  })

  it('should timeout and kill "git" process', (done) => {
    // replace spawn with custom spawn to trigger timeout
    const originalSpawn = childProcess.spawn
    const customSpawnHandler = (command, args, options) => {
      const mockProcess = {
        stdout: { on: () => {} },
        stderr: { on: () => {} },
        on: function (event, callback) {
          if (event === 'close') {
            setTimeout(() => {
              callback()
            }, 6000)
          }
        },
        kill: () => {}
      }
      return mockProcess
    }
    Object.defineProperty(childProcess, 'spawn', {
      value: customSpawnHandler,
      writable: true
    })

    // replace process.stderr.write with custom write to suppress output
    const errors = []
    const originalStderrWrite = process.stderr.write
    const customStderrWrite = (chunk, encoding, cb) => errors.push(chunk)
    Object.defineProperty(process.stderr, 'write', {
      value: customStderrWrite,
      writable: true
    })

    require(path.join(__dirname, '../fallback-dependencies.js'))

    setTimeout(() => {
      assert(errors[0].includes('Process killed due to timeout'), 'git process did not timeout')
      childProcess.spawn = originalSpawn // restore original spawn
      process.stderr.write = originalStderrWrite // restore original process.stderr.write
      done()
    }, 7000)
  })

  it('should throw an error if the "git tag" command fails', () => {
    fs.rmSync(path.join(__dirname, './clones'), { recursive: true, force: true })
    fs.rmSync(path.join(__dirname, './repos'), { recursive: true, force: true })
    const output = require(gitTagError)('fallbackDependencies')
    assert(output.includes('fatal: unterminated line in'), 'git tag command didn\'t throw an error')
  })

  it('should throw an error if the "git fetch --tags" command fails', () => {
    fs.rmSync(path.join(__dirname, './clones'), { recursive: true, force: true })
    fs.rmSync(path.join(__dirname, './repos'), { recursive: true, force: true })
    const output = require(gitFetchTagsError)('fallbackDependencies')
    assert(output.includes('fatal: couldn\'t find remote'), 'git fetch command didn\'t throw an error')
  })

  it('should throw an error if the "git checkout tag" command fails', () => {
    fs.rmSync(path.join(__dirname, './clones'), { recursive: true, force: true })
    fs.rmSync(path.join(__dirname, './repos'), { recursive: true, force: true })
    const output = require(gitCheckoutTagError)('fallbackDependencies')
    assert(output.includes('fatal: this operation must be run in a work tree'), 'git checkout command didn\'t throw an error')
  })

  it('should throw an error if the "git fetch remote" command fails when attempting to search for head branch', () => {
    fs.rmSync(path.join(__dirname, './clones'), { recursive: true, force: true })
    fs.rmSync(path.join(__dirname, './repos'), { recursive: true, force: true })
    const output = require(gitFetchHeadError)('fallbackDependencies')
    assert(output.includes('fatal: couldn\'t find remote'), 'git fetch command didn\'t throw an error')
  })

  it('should throw an error if the "git fetch remote" command fails', () => {
    fs.rmSync(path.join(__dirname, './clones'), { recursive: true, force: true })
    fs.rmSync(path.join(__dirname, './repos'), { recursive: true, force: true })
    const output = require(gitFetchRemoteError)('fallbackDependencies')
    assert(output.includes('fatal: couldn\'t find remote'), 'git fetch command didn\'t throw an error')
  })

  it('should throw an error if the "git checkout commit" command fails', () => {
    fs.rmSync(path.join(__dirname, './clones'), { recursive: true, force: true })
    fs.rmSync(path.join(__dirname, './repos'), { recursive: true, force: true })
    const output = require(gitCheckoutCommitError)('fallbackDependencies')
    assert(output.includes('fatal: this operation must be run in a work tree'), 'git checkout command didn\'t throw an error')
  })

  it('should throw an error if the "git pull remote branch" command fails', () => {
    fs.rmSync(path.join(__dirname, './clones'), { recursive: true, force: true })
    fs.rmSync(path.join(__dirname, './repos'), { recursive: true, force: true })
    const output = require(gitPullRemoteBranchError)('fallbackDependencies')
    assert(output.includes('fatal: Need to specify how to reconcile divergent branches.'), 'git pull remote branch command didn\'t throw an error')
  })

  it('should throw an error if the "git checkout version" command fails after a fresh clone', () => {
    fs.rmSync(path.join(__dirname, './clones'), { recursive: true, force: true })
    fs.rmSync(path.join(__dirname, './repos'), { recursive: true, force: true })
    const output = require(gitCloneCheckoutError)('fallbackDependencies')
    assert(output.includes('did not match any file(s) known to git'), 'git checkout command didn\'t throw an error')
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
