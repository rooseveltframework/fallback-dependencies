if (module.parent) {
  module.exports = {
    fallbackSandBox
  }
} else {
  fallbackSandBox()
}

function fallbackSandBox (appDir) {
  const fs = require('fs')
  const { execSync } = require('child_process')
  const rootPath = __dirname
  const path = require('path')
  if (!appDir) {
    let processEnv
    if (fs.existsSync(path.join(process.cwd(), 'node_modules')) === false) {
      processEnv = process.cwd()
    } else {
      processEnv = undefined
    }
    appDir = processEnv
  }
  const reposFolder = './test/repos'
  const clonesFolder = './test/clones'
  // Checks if the repos folder exist, if not it creates it
  try {
    if (!fs.existsSync(reposFolder)) {
      // creat the repos folder in the test folder
      fs.mkdirSync('./test/repos/', err => {
        if (err) {
          console.error(err)
        }
        // file written successfully
      })
    }
    // Checks if the clone folder exist, if not it creates it
    if (!fs.existsSync(clonesFolder)) {
    // creat the clones folder in the test folder
      fs.mkdirSync('./test/clones/', err => {
        if (err) {
          console.error(err)
        }
        // file written successfully
      })
    }
    // Checks if the repo1 folder exist, if not it creates it
    // creat the clones folder in the test folder
    fs.mkdirSync('./test/repos/repo1/', err => {
      if (err) {
        console.error(err)
      }
      // file written successfully
    })

    process.chdir('./test/repos/repo1')

    execSync('git --bare init',
        function (error) {
          if (error !== null) {
            console.log('exec error: ' + error)
          }
      })

    process.chdir(`${rootPath}/test/clones`)

    execSync(`git clone ${rootPath}/test/repos/repo1`,
        function (error) {
          if (error !== null) {
            console.log('exec error: ' + error)
          }
      })

    process.chdir(`${rootPath}/test/clones/repo1`)

    const clonesRepo1Package = {
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

    fs.writeFileSync(`${rootPath}/test/clones/repo1/package.json`, JSON.stringify(clonesRepo1Package))
    pushPackageJSON()
    process.chdir(`${rootPath}/test/clones/repo1`)

    const clonesRepo1PackageLocked = {
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

    fs.writeFileSync(`${rootPath}/test/clones/repo1/package-lock.json`, JSON.stringify(clonesRepo1PackageLocked))

    pushPackageLockJSON()

    process.chdir(`${rootPath}`)
    console.log('Present working directory: ' + process.cwd())

    fs.mkdirSync('./test/repos/repo2/', err => {
      if (err) {
        console.error(err)
      }
      // file written successfully
    })

    process.chdir(`${rootPath}/test/repos/repo2`)

    try {
      execSync('git --bare init')
    } catch (err) {
      console.log(err)
    }

    process.chdir(`${rootPath}/test/clones/`)

    try {
      execSync('git clone ../repos/repo2')
    } catch (err) {
      console.log(err)
    }

    process.chdir(`${rootPath}/test/clones/repo2`)

    const clonesRepo2Package = {
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

    fs.writeFileSync(`${rootPath}/test/clones/repo2/package.json`, JSON.stringify(clonesRepo2Package))

    pushPackageJSON()

    const clonesRepo2PackageLocked = {
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

    fs.writeFileSync(`${rootPath}/test/clones/repo2/package-lock.json`, JSON.stringify(clonesRepo2PackageLocked))

    pushPackageLockJSON()

    process.chdir(`${rootPath}`)

    fs.mkdirSync('./test/repos/repo3/', err => {
      if (err) {
        console.error(err)
      }
      // file written successfully
    })

    process.chdir('./test/repos/repo3')

    execSync('git --bare init',
      function (error) {
        if (error !== null) {
          console.log('exec error: ' + error)
        }
      })

    process.chdir(`${rootPath}/test/clones/`)

    try {
      execSync('git clone ../repos/repo3')
    } catch (err) {
      console.log(err)
    }

    process.chdir(`${rootPath}/test/clones/repo3`)

    const clonesRepo3Package = {}

    fs.writeFileSync(`${rootPath}/test/clones/repo3/package.json`, JSON.stringify(clonesRepo3Package))

    pushPackageJSON()

    const clonesRepo3PackageLocked = {
      name: 'repo3',
      lockfileVersion: 3,
      requires: true,
      packages: {}
    }

    fs.writeFileSync(`${rootPath}/test/clones/repo3/package-lock.json`, JSON.stringify(clonesRepo3PackageLocked))

    pushPackageLockJSON()

    process.chdir(`${rootPath}/test/clones/repo1`)
    try {
      execSync('npm i')
    } catch (err) {
      console.log(err)
    }
  } catch (err) { console.log(err) }
}

function pushPackageJSON () {
  const { execSync } = require('child_process')
  try {
    execSync('git add package.json')
    execSync('git commit -m "commit"')
    execSync('git push')
  } catch (err) {
    console.log(err)
  }
}

function pushPackageLockJSON () {
  const { execSync } = require('child_process')
  try {
    execSync('git add package-lock.json')
    execSync('git commit -m "commit"')
    execSync('git push')
  } catch (err) {
    console.log(err)
  }
}
