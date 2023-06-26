if (module.parent) {
  module.exports = {
    fallbackSandBox
  }
} else {
  fallbackSandBox()
}

function fallbackSandBox (appDir) {
  const fs = require('fs')
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

  const repoList = ['repo1', 'repo2', 'repo3']

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

    createRepo(repoList)
  } catch {}
}

function createRepo (repoList) {
  const rootPath = __dirname
  const { execSync } = require('child_process')
  const fs = require('fs')
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
  const repo3Package = {}
  const repo3PackageLocked = {
    name: 'repo3',
    lockfileVersion: 3,
    requires: true,
    packages: {}
  }
  for (const id in repoList) {
    console.log(repoList[id])
    fs.mkdirSync(`./repos/${repoList[id]}/`, err => {
      if (err) {
        console.error(err)
      }
    // file written successfully
    })
    const packageName = `${repoList[id]}Package`
    const packageLockName = `${repoList[id]}PackageLocked`

    process.chdir(`${rootPath}/repos/${repoList[id]}`)
    execSync('git --bare init')
    process.chdir(`${rootPath}/clones`)
    execSync(`git clone ${rootPath}/repos/${repoList[id]}`)
    process.chdir(`${rootPath}/clones/${repoList[id]}`)
    console.log(`${repoList[id]}Package`)
    fs.writeFileSync(`${rootPath}/clones/${repoList[id]}/package.json`, JSON.stringify(packageName))
    execSync('git add package.json')
    execSync('git commit -m "commit"')
    execSync('git push')
    fs.writeFileSync(`${rootPath}/clones/${repoList[id]}/package-lock.json`, JSON.stringify(packageLockName))
    execSync('git add package-lock.json')
    execSync('git commit -m "commit"')
    execSync('git push')
    process.chdir(`${rootPath}`)
    if (repoList[id] === 'repo3') {
      process.chdir(`${rootPath}/clones/repo1`)
      execSync('npm i')
    }
  }
}
