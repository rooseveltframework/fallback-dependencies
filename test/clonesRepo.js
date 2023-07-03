/* eslint-env mocha */
const assert = require('assert')
const cleanupTestApp = require('./util/cleanupTestApp')
// const fallback = require('./fallback-dep.js')

const path = require('path')
const appDir = path.join(__dirname, 'app/paramFunctionTest')
const fallBackSandBox = path.join(__dirname, './util/fallbackDep.js')
const fs = require('fs')
const { execSync } = require('child_process')

describe('Testing files in the clones/repo#', function () {
  before(function (done) {
    // Run fallback dependancy script
    execSync(`node ${fallBackSandBox}`)
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

  it('Testing if clones of the repos contain package.json', function () {
    // test to see if ./test/clones/repo1/package.json exist
    assert(fs.existsSync(path.join(__dirname, '/clones/repo1/package.json')) === true, './test/clones/repo1/package.json does not exist')
    // test to see if ./test/clones/repo2/package.json exist
    assert(fs.existsSync(path.join(__dirname, '/clones/repo2/package.json')) === true, './test/clones/repo2/package.json does not exist')
    // test to see if ./test/clones/repo3/package.json exist
    assert(fs.existsSync(path.join(__dirname, '/clones/repo3/package.json')) === true, './test/clones/repo3/package.json does not exist')
  })

  it('Testing if clones of the repos contain package-lock.json', function () {
    // test to see if ./test/clones/repo1/package-lock.json exist
    assert(fs.existsSync(path.join(__dirname, '/clones/repo1/package-lock.json')) === true, './test/clones/repo1/package-lock.json does not exist')
    // test to see if ./test/clones/repo2/package-lock.json exist
    assert(fs.existsSync(path.join(__dirname, '/clones/repo2/package-lock.json')) === true, './test/clones/repo2/package-lock.json does not exist')
    // test to see if ./test/clones/repo3/package-lock.json exist
    assert(fs.existsSync(path.join(__dirname, '/clones/repo3/package-lock.json')) === true, './test/clones/repo3/package-lock.json does not exist')
  })

  it('Testing if clones of the repos contain package-lock.json', function () {
    // test to see if ./test/clones/repo1/package-lock.json exist
    assert(fs.existsSync(path.join(__dirname, '/clones/repo1/package-lock.json')) === true, './test/clones/repo1/package-lock.json does not exist')
    // test to see if ./test/clones/repo2/package-lock.json exist
    assert(fs.existsSync(path.join(__dirname, '/clones/repo2/package-lock.json')) === true, './test/clones/repo2/package-lock.json does not exist')
    // test to see if ./test/clones/repo3/package-lock.json exist
    assert(fs.existsSync(path.join(__dirname, '/clones/repo3/package-lock.json')) === true, './test/clones/repo3/package-lock.json does not exist')
  })

  it('Testing if ./clones/repo1/package.json holds the right information', function () {
    const packageJSON = require('./clones/repo1/package.json')
    const repo1Package = {
      devDependencies: {
        'fallback-dependencies': '../../../'
      },
      fallbackDependencies: {
        dir: 'lib',
        repos: {
          'fallback-deps-test-repo-2': [
            '../../../repos/repo2'
          ]
        }
      },
      scripts: {
        postinstall: 'node node_modules/fallback-dependencies/fallback-dependencies.js'
      }
    }
    // test to see if ./test/clones/repo1/package-lock.json exist
    assert(fs.existsSync(path.join(__dirname, '/clones/repo1/package.json')) === true, './test/clones/repo1/package.json does not exist')
    assert.deepEqual(packageJSON, repo1Package, 'Testing to see if package.json in path matches the package object')
  })

  it('Testing if ./clones/repo2/package.json holds the right information', function () {
    const packageJSON = require('./clones/repo2/package.json')
    const repo2Package = {
      devDependencies: {
        'fallback-dependencies': '../../../../../'
      },
      fallbackDependencies: {
        dir: 'lib',
        repos: {
          'fallback-deps-test-repo-3': [
            '../../../../../repos/repo3'
          ]
        }
      },
      scripts: {
        postinstall: 'node node_modules/fallback-dependencies/fallback-dependencies.js'
      }
    }
    // test to see if ./test/clones/repo1/package-lock.json exist
    assert(fs.existsSync(path.join(__dirname, '/clones/repo2/package.json')) === true, './test/clones/repo1/package.json does not exist')
    assert.deepEqual(packageJSON, repo2Package, 'Testing to see if package.json in path matches the package object')
  })

  it('Testing if ./clones/repo3/package.json holds the right information', function () {
    const packageJSON = require('./clones/repo3/package.json')
    const repo3Package = {}

    // test to see if ./test/clones/repo1/package-lock.json exist
    assert(fs.existsSync(path.join(__dirname, '/clones/repo3/package.json')) === true, './test/clones/repo1/package.json does not exist')
    assert.deepEqual(packageJSON, repo3Package, 'Testing to see if package.json in path matches the package object')
  })

  it('Testing if ./clones/repo1/package-lock.json holds the right information', function () {
    const packageLock = require('./clones/repo1/package-lock.json')
    const repo1PackageLocked = {
      name: 'repo1',
      lockfileVersion: 3,
      requires: true,
      packages: {
        '': {
          hasInstallScript: true,
          devDependencies: {
            'fallback-dependencies': '../../../'
          }
        },
        '../../..': {
          version: '0.1.0',
          dev: true,
          license: 'CC-BY-4.0',
          devDependencies: {}
        },
        'node_modules/fallback-dependencies': {
          resolved: '../../..',
          link: true
        }
      }
    }
    try {
      assert(fs.existsSync(path.join(__dirname, '/clones/repo1/package-lock.json')) === true, './test/clones/repo1/package-lock.json does not exist')
      assert.deepEqual(packageLock, repo1PackageLocked, 'Testing to see if package-lock.json in path matches the package-lock object ')
    } catch {}
  })

  it('Testing if ./clones/repo2/package-lock.json holds the right information', function () {
    const packageLock = require('./clones/repo2/package-lock.json')
    const repo2PackageLocked = {
      name: 'repo1',
      lockfileVersion: 3,
      requires: true,
      packages: {
        '': {
          hasInstallScript: true,
          devDependencies: {
            'fallback-dependencies': '../../../../../'
          }
        },
        '../../../../..': {
          version: '0.1.0',
          dev: true,
          license: 'CC-BY-4.0',
          devDependencies: {}
        },
        'node_modules/fallback-dependencies': {
          resolved: '../../../../..',
          link: true
        }
      }
    }
    try {
      assert(fs.existsSync(path.join(__dirname, '/clones/repo2/package-lock.json')) === true, './test/clones/repo2/package-lock.json does not exist')
      assert.deepEqual(packageLock, repo2PackageLocked, 'Testing to see if package-lock.json in path matches the package-lock object ')
    } catch {}
  })

  it('Testing if ./clones/repo3/package-lock.json holds the right information', function () {
    const packageLock = require('./clones/repo3/package-lock.json')
    const repo3PackageLocked = {
      name: 'repo3',
      lockfileVersion: 3,
      requires: true,
      packages: {}
    }
    try {
      assert(fs.existsSync(path.join(__dirname, '/clones/repo3/package-lock.json')) === true, './test/clones/repo3/package-lock.json does not exist')
      assert.deepEqual(packageLock, repo3PackageLocked, 'Testing to see if package-lock.json in path matches the package-lock object ')
    } catch {}
  })
})
