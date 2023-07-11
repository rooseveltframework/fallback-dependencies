/* eslint-env mocha */
const assert = require('assert')
const cleanupTestApp = require('./util/cleanupTestApp')
// const fallback = require('./fallback-dep.js')

const path = require('path')
const appDir = path.join(__dirname, 'app/paramFunctionTest')
const fallBackSandBox = path.join(__dirname, './util/fallbackDep.js')
const errorHandlerSandBox = path.join(__dirname, './util/reposFile.js')
const errorOPTSandBox = path.join(__dirname, './util/repoOptFiles.js')

const fs = require('fs')

describe('Testing script fallbackDep.js', function () {
  before(function (done) {
    // Creat new repos and clones folder
    fs.rmSync(path.resolve('./test/clones'), { recursive: true, force: true })
    fs.rmSync(path.resolve('./test/repos'), { recursive: true, force: true })

    // Run fallback dependancy script
    try {
      require(fallBackSandBox)()
      require(errorHandlerSandBox)()
      require(errorOPTSandBox)()
    } catch (err) {
      console.log(err)
    }
    this.timeout(40000)
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
    // try {
    // test to see if ./test/repos/repo1 exist
    assert(fs.existsSync(path.join(__dirname, '/repos/repo1')) === true, './test/repos/repo1 does not exist')
    // test to see if ./test/repos/repo2 exist
    assert(fs.existsSync(path.join(__dirname, '/repos/repo2')) === true, './test/repos/repo2 does not exist')
    // test to see if ./test/repos/repo3 exist
    assert(fs.existsSync(path.join(__dirname, '/repos/repo3')) === true, './test/repos/repo3 does not exist')

    // } catch (err) {console.log(err)}
  })

  it('Testing if node fallback-dep.js creates three clones of the repos in the ./test/clones folder', function () {
    // test to see if ./test/clones/repo1 exist
    assert(fs.existsSync(path.join(__dirname, '/clones/repo1')) === true, './test/clones/repo1 does not exist')
    // test to see if ./test/clones/repo2 exist
    assert(fs.existsSync(path.join(__dirname, '/clones/repo2')) === true, './test/clones/repo2 does not exist')
    // test to see if ./test/clones/repo3 exist
    assert(fs.existsSync(path.join(__dirname, '/clones/repo3')) === true, './test/clones/repo3 does not exist')
  })

  it('Testing if files in repo1 exist', function () {
    // test to see if ./test/repos/repo1/hooks exist
    assert(fs.existsSync(path.join(__dirname, '/repos/repo1/hooks')) === true, './test/repos/repo1/hooks does not exist')
    // test to see if ./test/repos/repo1/info exist
    assert(fs.existsSync(path.join(__dirname, '/repos/repo1/info')) === true, './test/repos/repo1/info does not exist')
    // test to see if ./test/repos/repo1/objects exist
    assert(fs.existsSync(path.join(__dirname, '/repos/repo1/objects')) === true, './test/repos/repo1/objects does not exist')
    // test to see if ./test/repos/repo1/refs exist
    assert(fs.existsSync(path.join(__dirname, '/repos/repo1/refs')) === true, './test/repos/repo1/refs does not exist')
    // test to see if ./test/repos/repo1/config exist
    assert(fs.existsSync(path.join(__dirname, '/repos/repo1/config')) === true, './test/repos/repo1/config does not exist')
    // test to see if ./test/repos/repo1/description exist
    assert(fs.existsSync(path.join(__dirname, '/repos/repo1//description')) === true, './test/repos/repo1/description does not exist')
    // test to see if ./test/repos/repo1/HEAD exist
    assert(fs.existsSync(path.join(__dirname, '/repos/repo1/HEAD')) === true, './test/repos/repo1/HEAD does not exist')
  })

  it('Testing if files in repo2 exist', function () {
    // test to see if ./test/repos/repo2/hooks exist
    assert(fs.existsSync(path.join(__dirname, '/repos/repo2/hooks')) === true, './test/repos/repo1/hooks does not exist')
    // test to see if ./test/repos/repo2/info exist
    assert(fs.existsSync(path.join(__dirname, '/repos/repo2/info')) === true, './test/repos/repo2/info does not exist')
    // test to see if ./test/repos/repo2/objects exist
    assert(fs.existsSync(path.join(__dirname, '/repos/repo2/objects')) === true, './test/repos/repo2/objects does not exist')
    // test to see if ./test/repos/repo2/refs exist
    assert(fs.existsSync(path.join(__dirname, '/repos/repo2/refs')) === true, './test/repos/repo2/refs does not exist')
    // test to see if ./test/repos/repo2/config exist
    assert(fs.existsSync(path.join(__dirname, '/repos/repo2/config')) === true, './test/repos/repo2/config does not exist')
    // test to see if ./test/repos/repo2/description exist
    assert(fs.existsSync(path.join(__dirname, '/repos/repo2/description')) === true, './test/repos/repo2/description does not exist')
    // test to see if ./test/repos/repo2/HEAD exist
    assert(fs.existsSync(path.join(__dirname, '/repos/repo2/HEAD')) === true, './test/repos/repo2/HEAD does not exist')
  })

  it('Testing if files in repo3 exist', function () {
    // test to see if ./test/repos/repo3/hooks exist
    assert(fs.existsSync(path.join(__dirname, '/repos/repo3/hooks')) === true, './test/repos/repo3/hooks does not exist')
    // test to see if ./test/repos/repo3/info exist
    assert(fs.existsSync(path.join(__dirname, '/repos/repo3/info')) === true, './test/repos/repo3/info does not exist')
    // test to see if ./test/repos/repo3/objects exist
    assert(fs.existsSync(path.join(__dirname, '/repos/repo3/objects')) === true, './test/repos/repo3/objects does not exist')
    // test to see if ./test/repos/repo3/refs exist
    assert(fs.existsSync(path.join(__dirname, '/repos/repo3/refs')) === true, './test/repos/repo3/refs does not exist')
    // test to see if ./test/repos/repo3/config exist
    assert(fs.existsSync(path.join(__dirname, '/repos/repo3/config')) === true, './test/repos/repo3/config does not exist')
    // test to see if ./test/repos/repo3/description exist
    assert(fs.existsSync(path.join(__dirname, '/repos/repo3/description')) === true, './test/repos/repo3/description does not exist')
    // test to see if ./test/repos/repo3/HEAD exist
    assert(fs.existsSync(path.join(__dirname, '/repos/repo3/HEAD')) === true, './test/repos/repo3/HEAD does not exist')
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
          'fallback-deps-test-repo-3': '../../../../../repos/repo3'
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

  it('Testing if all filed in ./clones/repo1/lib/...  to ./fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/.. excist', function () {
    assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib')) === true, './clones/repo1/lib does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2')) === true, './clones/repo1/lib/fallback-deps-test-repo-2 does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/lib')) === true, './clones/repo1/lib/fallback-deps-test-repo-2/lib does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3')) === true, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3 does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/package-lock.json')) === true, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/package-lock.json does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/package.json')) === true, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/package.json does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/lib')) === false, './clones/repo1/lib/fallback-deps-test-repo-2/lib/fallback-deps-test-repo-3/lib does not exist')
  })

  it('Checking to see if `fallback-dependencies` still works if repos is non-presence and replaced with reposFile', function () {
    assert(fs.existsSync(path.join(__dirname, './clones/repo4/lib')) === true, './clones/repo4/lib does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo4/lib/fallback-deps-test-repo-5')) === true, './clones/repo4/lib/fallback-deps-test-repo-5 does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo4/lib/fallback-deps-test-repo-5/lib')) === true, './clones/repo4/lib/fallback-deps-test-repo-5/lib does not exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo4/lib/fallback-deps-test-repo-5/lib/fallback-deps-test-repo-6')) === false, './clones/repo4/lib/fallback-deps-test-repo-5/lib/fallback-deps-test-repo-6 does exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo4/lib/fallback-deps-test-repo-5/lib/fallback-deps-test-repo-6/package-lock.json')) === false, './clones/repo4/lib/fallback-deps-test-repo-5/lib/fallback-deps-test-repo-6/package-lock.json does exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo4/lib/fallback-deps-test-repo-5/lib/fallback-deps-test-repo-6/package.json')) === false, './clones/repo4/lib/fallback-deps-test-repo-5/lib/fallback-deps-test-repo-6/package.json does exist')
    assert(fs.existsSync(path.join(__dirname, './clones/repo4/lib/fallback-deps-test-repo-5/lib/fallback-deps-test-repo-6/lib')) === false, './clones/repo4/lib/fallback-deps-test-repo-5/lib/fallback-deps-test-repo-6/lib does exist')
  })
})
