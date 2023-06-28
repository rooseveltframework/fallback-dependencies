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
  // const reposFolder = './../test/repos'
  // const clonesFolder = './../test/clones'

  const repoList = ['repo1', 'repo2', 'repo3']

  // Checks if the repos folder exist, if not it creates it
  try {
    if (!fs.existsSync('./../test/repos')) {
      // creat the repos folder in the test folder
      fs.mkdirSync('./../test/repos', err => {
        if (err) {
          console.error(err)
        }
        // file written successfully
      })
    }
    // Checks if the clone folder exist, if not it creates it
    if (!fs.existsSync('./../test/clones')) {
    // creat the clones folder in the test folder
      fs.mkdirSync('./../test/clones/', err => {
        if (err) {
          console.error(err)
        }
        // file written successfully
      })
    }

    createRepo(repoList, appDir)
  } catch {}
}

function createRepo (repoList, appDir) {
  const rootPath = __dirname
  console.log(rootPath)
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
  const packageList = [[repo1Package, repo1PackageLocked], [repo2Package, repo2PackageLocked], [repo3Package, repo3PackageLocked]]
  for (const id in repoList) {
    fs.mkdirSync(`${appDir}/repos/${repoList[id]}/`, err => {
      if (err) {
        console.error(err)
      }
    // file written successfully
    })

    try {
      process.chdir(`${appDir}/repos/${repoList[id]}`)
      process.chdir(`${appDir}/repos/${repoList[id]}`)
      execSync('git --bare init')
      process.chdir(`${appDir}/clones`)
      execSync(`git clone ${appDir}/repos/${repoList[id]}`)
      process.chdir(`${appDir}/clones/${repoList[id]}`)
      console.log(`${repoList[id]}Package`)
      fs.writeFileSync(`${appDir}/clones/${repoList[id]}/package.json`, JSON.stringify(packageList[id][0]))
      execSync('git add package.json')
      execSync('git commit -m "commit"')
      execSync('git push')
      fs.writeFileSync(`${appDir}/clones/${repoList[id]}/package-lock.json`, JSON.stringify(packageList[id][1]))
      execSync('git add package-lock.json')
      execSync('git commit -m "commit"')
      execSync('git push')
      process.chdir(`${appDir}`)
      if (repoList[id] === 'repo3') {
        process.chdir(`${appDir}/clones/repo1`)
        execSync('npm i')
      }
    } catch (err) {
      console.log(err)
    }
  }
}
