/* eslint-env mocha */
const assert = require('assert')
const cleanupTestApp = require('./util/cleanupTestApp')
// const fallback = require('./fallback-dep.js')

const path = require('path')
const appDir = path.join(__dirname, 'app/paramFunctionTest')
const fs = require('fs')
const { execSync } = require('child_process')

describe('Testing script fallbackDep.js', function () {
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

  it('Testing if node fallbackDep.js creates a clones and repos folder in the ./test folder', function () {
    // test to see if ./test/clones exist
    assert(fs.existsSync(path.join(__dirname, '/clones')) === true, './test/clones does not exist')
    // test to see if ./test/repos exist
    assert(fs.existsSync(path.join(__dirname, '/repos')) === true, './test/repos does not exist')
  })

  it('Testing if node fallback-dep.js creates three repos in the ./test/repos folder', function () {
    // test to see if ./test/repos/repo1 exist
    assert(fs.existsSync(path.join(__dirname, '/repos/repo1')) === true, './test/repos/repo1 does not exist')
    // test to see if ./test/repos/repo2 exist
    assert(fs.existsSync(path.join(__dirname, '/repos/repo2')) === true, './test/repos/repo2 does not exist')
    // test to see if ./test/repos/repo3 exist
    assert(fs.existsSync(path.join(__dirname, '/repos/repo3')) === true, './test/repos/repo3 does not exist')
  })

  it('Testing if node fallback-dep.js creates three clones of the repos in the ./test/clones folder', function () {
    // test to see if ./test/clones/repo1 exist
    assert(fs.existsSync(path.join(__dirname, '/clones/repo1')) === true, './test/clones/repo1 does not exist')
    // test to see if ./test/clones/repo2 exist
    assert(fs.existsSync(path.join(__dirname, '/clones/repo2')) === true, './test/clones/repo2 does not exist')
    // test to see if ./test/clones/repo3 exist
    assert(fs.existsSync(path.join(__dirname, '/clones/repo3')) === true, './test/clones/repo3 does not exist')
  })

  it('Testing if clones of the repos contain package.json', function () {
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
    const repo3Package = {}
    // test to see if ./test/clones/repo1/package.json exist
    assert(fs.existsSync(path.join(__dirname, '/clones/repo1/package.json')) === true, './test/clones/repo1/package.json does not exist')
    // test to see if ./test/clones/repo2/package.json exist
    assert(fs.existsSync(path.join(__dirname, '/clones/repo2/package.json')) === true, './test/clones/repo2/package.json does not exist')
    // test to see if ./test/clones/repo3/package.json exist
    assert(fs.existsSync(path.join(__dirname, '/clones/repo3/package.json')) === true, './test/clones/repo3/package.json does not exist')
  })

  it('Testing if clones of the repos contain package-lock.json', function () {
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
    const repo3PackageLocked = {
      name: 'repo3',
      lockfileVersion: 3,
      requires: true,
      packages: {}
    }
    // test to see if ./test/clones/repo1/package-lock.json exist
    assert(fs.existsSync(path.join(__dirname, '/clones/repo1/package-lock.json')) === true, './test/clones/repo1/package-lock.json does not exist')
    // test to see if ./test/clones/repo2/package-lock.json exist
    assert(fs.existsSync(path.join(__dirname, '/clones/repo2/package-lock.json')) === true, './test/clones/repo2/package-lock.json does not exist')
    // test to see if ./test/clones/repo3/package-lock.json exist
    assert(fs.existsSync(path.join(__dirname, '/clones/repo3/package-lock.json')) === true, './test/clones/repo3/package-lock.json does not exist')
  })
})
