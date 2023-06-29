if (module.parent) {
  module.exports = {
    fallbackDependancySandBox
  }
} else {
  fallbackDependancySandBox()
}
function fallbackDependancySandBox (appDir) {
  const fs = require('fs')
  const path = require('path')
  const { execSync } = require('child_process')
  const repoList = ['repo1', 'repo2', 'repo3']

  if (!appDir) {
    let processEnv
    if (fs.existsSync(path.join(process.cwd(), 'node_modules')) === false) {
      processEnv = process.cwd()
    } else {
      processEnv = undefined
    }
    appDir = processEnv
  }

  // Checks if the repos folder exist, if not it creates it
  try {
    if (!fs.existsSync('./test/repos')) {
      // creat the repos folder in the test folder
      fs.mkdirSync('./test/repos', err => {
        if (err) {
          console.error(err)
        }
        // file written successfully
      })
    }
    // Checks if the clone folder exist, if not it creates it
    if (!fs.existsSync('./test/clones')) {
    // creat the clones folder in the test folder
      fs.mkdirSync('./test/clones/', err => {
        if (err) {
          console.error(err)
        }
        // file written successfully
      })
    }

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
    const rootPath = __dirname
    for (const id in repoList) {
      if (!fs.existsSync(`${rootPath}/repos/${repoList[id]}/`)) {
        fs.mkdirSync(`${rootPath}/repos/${repoList[id]}/`, err => {
          if (err) {
            console.error(err)
          }
          // file written successfully
        })
      }
      // Change directory path
      process.chdir(`${rootPath}/repos/${repoList[id]}`)
      // Run git command
      // console.log(appDir)
      // console.log(process.cwd())
      execSync('git --bare init')
      // Change directory path
      process.chdir(`${rootPath}/clones`)
      // // Run git command
      execSync(`git clone ${rootPath}/repos/${repoList[id]}`)
      // Change directory path
      process.chdir(`${rootPath}/clones/${repoList[id]}`)
      // Create the package.json file in the ./clones/..
      fs.writeFileSync(`${rootPath}/clones/${repoList[id]}/package.json`, JSON.stringify(packageList[id][0]))
      // Run git command
      execSync('git add package.json')
      execSync('git commit -m "commit"')
      execSync('git push')
      // Create the package-lock.json file in the ./clones/..
      fs.writeFileSync(`${rootPath}/clones/${repoList[id]}/package-lock.json`, JSON.stringify(packageList[id][1]))
      // Run git command
      execSync('git add package-lock.json')
      execSync('git commit -m "commit"')
      execSync('git push')
      // Change directory path
      process.chdir(`${rootPath}`)
      // When we are in the last repo change path directory and run npm i
      if (repoList[id] === 'repo3') {
        process.chdir(`${rootPath}/clones/repo1`)
        execSync('npm i')
      }
    }
  } catch {}
}
