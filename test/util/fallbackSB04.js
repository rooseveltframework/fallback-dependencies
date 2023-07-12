module.exports = fallbackDependancySandBox

function fallbackDependancySandBox (appDir) {
  const fs = require('fs')
  const path = require('path')
  const testSrc = path.resolve(__dirname, '../../test')
  const { execSync } = require('child_process')
  const repoList = ['repo10', 'repo11', 'repo12']

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

    const repo10Package = {
      devDependencies: {
        'fallback-dependencies': '../../../'
      },
      fallbackDependencies: {
        dir: 'lib',
        reposFile: 'reposFile.json'
      },
      scripts: {
        postinstall: 'node node_modules/fallback-dependencies/fallback-dependencies.js'
      }
    }
    const repo10PackageLocked = {
      name: 'repo10',
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
          license: 'CC-BY-10.0',
          devDependencies: {}
        },
        'node_modules/fallback-dependencies': {
          resolved: '../../..',
          link: true
        }
      }
    }
    const repo10FileData = {
      'fallback-deps-test-repo-11': [
        '../../../repos/repo11'
      ]
    }
    const repo11Package = {
      devDependencies: {
        'fallback-dependencies': '../../../../../'
      },
      fallbackDependencies: {
        dir: 'test/lib',
        repos: {
          'fallback-deps-test-repo-12:': '../../../../../repos/repo12'
        },
        // misspell file name to cover lines 111-111
        reposFile: 'reposFile.json'
      },
      scripts: {
        postinstall: 'node node_modules/fallback-dependencies/fallback-dependencies.js'
      }
    }
    const repo11PackageLocked = {
      name: 'repo10',
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
          license: 'CC-BY-10.0',
          devDependencies: {}
        },
        'node_modules/fallback-dependencies': {
          resolved: '../../../../..',
          link: true
        }
      }
    }
    const repo12Package = {}
    const repo12PackageLocked = {
      name: 'repo12',
      lockfileVersion: 3,
      requires: true,
      packages: {}
    }

    const packageList = [[repo10Package, repo10PackageLocked], [repo11Package, repo11PackageLocked], [repo12Package, repo12PackageLocked]]
    for (const id in repoList) {
      if (!fs.existsSync(`${testSrc}/repos/${repoList[id]}/`)) {
        fs.mkdirSync(`${testSrc}/repos/${repoList[id]}/`, err => {
          if (err) {
            console.error(err)
          }
          // file written successfully
        })
      }
      // Change directory path run git command
      execSync('git --bare init', {
        stdio: 'pipe', // hide output from git
        cwd: path.resolve(`${testSrc}/repos/${repoList[id]}`, '') // where we're cloning the repo to
      })
      // Change directory path run git command
      execSync(`git clone ${testSrc}/repos/${repoList[id]}`, {
        stdio: 'pipe', // hide output from git
        cwd: path.resolve(`${testSrc}/clones`, '') // where we're cloning the repo to
      })
      if (repoList[id] === 'repo10') {
        fs.writeFileSync(`${testSrc}/clones/repo10/reposFile.json`, JSON.stringify(repo10FileData))
      }
      // Change directory path
      process.chdir(`${testSrc}/clones/${repoList[id]}`)
      // Create the package.json and package-lock.json file in the ./clones/..
      fs.writeFileSync(`${testSrc}/clones/${repoList[id]}/package.json`, JSON.stringify(packageList[id][0]))
      fs.writeFileSync(`${testSrc}/clones/${repoList[id]}/package-lock.json`, JSON.stringify(packageList[id][1]))

      // Run git command to push package and package-lock files
      execSync('git add .', {
        stdio: 'pipe', // hide output from git
        cwd: path.resolve(`${testSrc}/clones/${repoList[id]}`, '') // where we're cloning the repo to
      })
      execSync('git commit -m "commit"', {
        stdio: 'pipe', // hide output from git
        cwd: path.resolve(`${testSrc}/clones/${repoList[id]}`, '') // where we're cloning the repo to
      })
      execSync('git push', {
        stdio: 'pipe', // hide output from git
        cwd: path.resolve(`${testSrc}/clones/${repoList[id]}`, '') // where we're cloning the repo to
      })
    }
    // Run git command to push package and package-lock files
    const we = execSync('npm ci', {
      stdio: 'pipe', // hide output from git
      cwd: path.resolve(`${testSrc}/clones/repo10`, '') // where we're cloning the repo to
    })

    console.log(we.toString())
  } catch {}
}
