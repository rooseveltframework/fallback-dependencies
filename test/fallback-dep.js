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
  const reposFolder = './repos'
  const clonesFolder = './clones'
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
  const clonesRepo3Package = {}
  const clonesRepo3PackageLocked = {
    name: 'repo3',
    lockfileVersion: 3,
    requires: true,
    packages: {}
  }

  // Checks if the repos folder exist, if not it creates it
  try {
    if (!fs.existsSync(reposFolder)) {
      // creat the repos folder in the test folder
      fs.mkdirSync('./repos/', err => {
        if (err) {
          console.error(err)
        }
        // file written successfully
      })
    }
    // Checks if the clone folder exist, if not it creates it
    if (!fs.existsSync(clonesFolder)) {
    // creat the clones folder in the test folder
      fs.mkdirSync('./clones/', err => {
        if (err) {
          console.error(err)
        }
        // file written successfully
      })
    }
    // Checks if the repo1 folder exist, if not it creates it
    // creat the clones folder in the test folder
    fs.mkdirSync('./repos/repo1/', err => {
      if (err) {
        console.error(err)
      }
      // file written successfully
    })

    process.chdir(`${rootPath}/repos/repo1`)

    execSync('git --bare init',
        function (error) {
          if (error !== null) {
            console.log('exec error: ' + error)
          }
      })

    process.chdir(`${rootPath}/clones`)

    try {
      execSync(`git clone ${rootPath}/repos/repo1`)
    } catch (err) {
      console.log(err)
    }

    process.chdir(`${rootPath}/clones/repo1`)

    fs.writeFileSync(`${rootPath}/clones/repo1/package.json`, JSON.stringify(clonesRepo1Package))

    pushPackageJSON()

    fs.writeFileSync(`${rootPath}/clones/repo1/package-lock.json`, JSON.stringify(clonesRepo1PackageLocked))

    pushPackageLockJSON()

    process.chdir(`${rootPath}`)

    fs.mkdirSync('./repos/repo2/', err => {
      if (err) {
        console.error(err)
      }
      // file written successfully
    })

    process.chdir(`${rootPath}/repos/repo2`)

    try {
      execSync('git --bare init')
    } catch (err) {
      console.log('exec error: ' + err)
    }

    process.chdir(`${rootPath}/clones/`)

    try {
      execSync('git clone ../repos/repo2')
    } catch (err) {
      console.log(err)
    }

    process.chdir(`${rootPath}/clones/repo2`)

    fs.writeFileSync(`${rootPath}/clones/repo2/package.json`, JSON.stringify(clonesRepo2Package))

    pushPackageJSON()

    fs.writeFileSync(`${rootPath}/clones/repo2/package-lock.json`, JSON.stringify(clonesRepo2PackageLocked))

    pushPackageLockJSON()

    process.chdir(`${rootPath}`)

    fs.mkdirSync('./repos/repo3/', err => {
      if (err) {
        console.error(err)
      }
      // file written successfully
    })

    process.chdir('./repos/repo3')

    try {
      execSync('git --bare init')
    } catch (err) {
      console.log('exec error: ' + err)
    }

    process.chdir(`${rootPath}/clones/`)

    try {
      execSync('git clone ../repos/repo3')
    } catch (err) {
      console.log(err)
    }

    process.chdir(`${rootPath}/clones/repo3`)

    fs.writeFileSync(`${rootPath}/clones/repo3/package.json`, JSON.stringify(clonesRepo3Package))

    pushPackageJSON()

    fs.writeFileSync(`${rootPath}/clones/repo3/package-lock.json`, JSON.stringify(clonesRepo3PackageLocked))

    pushPackageLockJSON()

    process.chdir(`${rootPath}/clones/repo1`)
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
