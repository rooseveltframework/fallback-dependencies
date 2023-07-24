module.exports = fallbackDependancySandBox

function fallbackDependancySandBox (appDir) {
  const fs = require('fs')
  const path = require('path')
  const testSrc = path.resolve(__dirname, '../../test')
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

  if (fs.existsSync(`${testSrc}/repos`)) {
    fs.rmSync(`${testSrc}/repos`, { recursive: true, force: true })
  }
  // Checks if the clone folder exist, if not it creates it
  if (fs.existsSync(`${testSrc}/clones`)) {
    fs.rmSync(`${testSrc}/clones`, { recursive: true, force: true })
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

    const repo1Package = {
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
          license: 'CC-BY-1.0',
          devDependencies: {}
        },
        'node_modules/fallback-dependencies': {
          resolved: '../../..',
          link: true
        }
      }
    }
    const repo1FileData = {
      'fallback-deps-test-repo-2': [
        '../../../repos/repo2', 'git://github.com/rooseveltframework/roosevelt.git -b 0.21.0 -skip-deps'
      ]
    }
    const repo2Package = {
      devDependencies: {
        'fallback-dependencies': '../../../../../../'
      },
      fallbackDependencies: {
        dir: 'lib',
        repos: {
          'fallback-deps-test-repo-3': '../../../../../repos/repo3'
        },
        reposFile: 'reposFile.json'
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
          license: 'CC-BY-1.0',
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
        cwd: path.normalize(`${testSrc}/repos/${repoList[id]}`, '') // where we're cloning the repo to
      })
      // Change directory path run git command
      execSync(`git clone "${testSrc}/repos/${repoList[id]}"`, {
        stdio: 'pipe', // hide output from git
        cwd: path.normalize(`${testSrc}/clones`, '') // where we're cloning the repo to
      })
      if (repoList[id] === 'repo1') {
        fs.writeFileSync(`${testSrc}/clones/repo1/reposFile.json`, JSON.stringify(repo1FileData))
      }
      // Change directory path
      process.chdir(`${testSrc}/clones/${repoList[id]}`)
      // Create the package.json and package-lock.json file in the ./clones/..
      fs.writeFileSync(`${testSrc}/clones/${repoList[id]}/package.json`, JSON.stringify(packageList[id][0]))
      fs.writeFileSync(`${testSrc}/clones/${repoList[id]}/package-lock.json`, JSON.stringify(packageList[id][1]))

      // Run git command to push package and package-lock files
      execSync('git add .', {
        stdio: 'pipe', // hide output from git
        cwd: path.normalize(`${testSrc}/clones/${repoList[id]}`, '') // where we're cloning the repo to
      })
      execSync('git commit -m "commit"', {
        stdio: 'pipe', // hide output from git
        cwd: path.normalize(`${testSrc}/clones/${repoList[id]}`, '') // where we're cloning the repo to
      })
      execSync('git push', {
        stdio: 'pipe', // hide output from git
        cwd: path.normalize(`${testSrc}/clones/${repoList[id]}`, '') // where we're cloning the repo to
      })
    }
    execSync('npm ci', {
      stdio: 'pipe', // hide output from git
      cwd: path.normalize(`${testSrc}/clones/repo1`, '') // where we're cloning the repo to
    })
    execSync('npm ci', {
      stdio: 'pipe', // hide output from git
      cwd: path.normalize(`${testSrc}/clones/repo1`, '') // where we're cloning the repo to
    })
  } catch {}
}
