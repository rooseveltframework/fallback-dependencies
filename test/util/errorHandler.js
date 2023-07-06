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
  const testSrc = path.resolve(__dirname, '../../test')
  const { execSync } = require('child_process')
  const repoList = ['repo4', 'repo5', 'repo6']

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
    if (!fs.existsSync(`${testSrc}/repos`)) {
      // creat the repos folder in the test folder
      fs.mkdirSync(`${testSrc}/repos`, err => {
        if (err) {
          console.error(err)
        }
        // file written successfully
      })
    }
    // Checks if the clone folder exist, if not it creates it
    if (!fs.existsSync(`${testSrc}/clones`)) {
      // creat the clones folder in the test folder
      fs.mkdirSync(`${testSrc}/clones`, err => {
        if (err) {
          console.error(err)
        }
        // file written successfully
      })
    }

    const repo4Package = {
      devDependencies: {
        'fallback-dependencies': '../../../'
      },
      fallbackDependencies: {
        dir: 'lib'
      },
      scripts: {
        postinstall: 'node node_modules/fallback-dependencies/fallback-dependencies.js -b 1.0.5 -skip-deps'
      }
    }
    const repo4PackageLocked = {
      name: 'repo4',
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
    const repo5Package = {
      devDependencies: {
        'fallback-dependencies': '../../../../../'
      },
      fallbackDependencies: {
        dir: 'lib',
        repo: {}
        // repos: {
        //   'fallback-deps-test-repo-6': [
        //     '../../../../../repos/repo6'
        //   ]
        // }
      },
      scripts: {
        postinstall: 'node node_modules/fallback-dependencies/fallback-dependencies.js -b 1.0.5 -skip-deps'
      }
    }
    const repo5PackageLocked = {
      name: 'repo4',
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
    const repo6Package = {}
    const repo6PackageLocked = {
      name: 'repo6',
      lockfileVersion: 3,
      requires: true,
      packages: {}
    }
    const packageList = [[repo4Package, repo4PackageLocked], [repo5Package, repo5PackageLocked], [repo6Package, repo6PackageLocked]]
    for (const id in repoList) {
      if (!fs.existsSync(`${testSrc}/repos/${repoList[id]}/`)) {
        fs.mkdirSync(`${testSrc}/repos/${repoList[id]}/`, err => {
          if (err) {
            console.error(err)
          }
          // file written successfully
        })
      }
      // Change directory path
      process.chdir(`${testSrc}/repos/${repoList[id]}`)
      // Run git command
      // console.log(appDir)
      // console.log(process.cwd())
      execSync('git --bare init')
      // Change directory path
      // process.chdir(`${rootPath}/clones`)
      process.chdir(`${testSrc}/clones`)
      // // Run git command
      execSync(`git clone ${testSrc}/repos/${repoList[id]}`)
      // Change directory path
      process.chdir(`${testSrc}/clones/${repoList[id]}`)
      // Create the package.json file in the ./clones/..
      fs.writeFileSync(`${testSrc}/clones/${repoList[id]}/package.json`, JSON.stringify(packageList[id][0]))
      // Run git command
      execSync('git add package.json')
      execSync('git commit -m "commit"')
      execSync('git push')
      // Create the package-lock.json file in the ./clones/..
      fs.writeFileSync(`${testSrc}/clones/${repoList[id]}/package-lock.json`, JSON.stringify(packageList[id][1]))
      // Run git command
      execSync('git add package-lock.json')
      execSync('git commit -m "commit"')
      execSync('git push')
      // Change directory path
      process.chdir(`${testSrc}`)
      // When we are in the last repo change path directory and run npm i
      if (repoList[id] === 'repo6') {
        process.chdir(`${testSrc}/clones/repo4`)
        execSync('npm ci')
      }
    }
  } catch {}
}
