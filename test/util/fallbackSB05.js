module.exports = fallbackDependancySandBox

function fallbackDependancySandBox (appDir) {
  const fs = require('fs')
  const path = require('path')
  const testSrc = path.resolve(__dirname, '../../test')
  const { execSync } = require('child_process')
  const repoList = ['repo13', 'repo14', 'repo15']

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

    const repo13Package = {
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
    const repo13PackageLocked = {
      name: 'repo13',
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
          license: 'CC-BY-13.0',
          devDependencies: {}
        },
        'node_modules/fallback-dependencies': {
          resolved: '../../..',
          link: true
        }
      }
    }
    const repo13FileData = {
      'fallback-deps-test-repo-30': [
        '../../../repos/repo30'
      ]
    }
    const repo14Package = {
      devDependencies: {
        'fallback-dependencies': '../../../../../../'
      },
      fallbackDependencies: {
        dir: 'lib',
        repos: {
          'fallback-deps-test-repo-15': '../../../../../repos/repo15'
        }
      },
      scripts: {
        postinstall: 'node node_modules/fallback-dependencies/fallback-dependencies.js'
      }
    }
    const repo14PackageLocked = {
      name: 'repo13',
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
          license: 'CC-BY-13.0',
          devDependencies: {}
        },
        'node_modules/fallback-dependencies': {
          resolved: '../../../../..',
          link: true
        }
      }
    }
    const repo15Package = {}
    const repo15PackageLocked = {
      name: 'repo15',
      lockfileVersion: 3,
      requires: true,
      packages: {}
    }
    const repo30Package = {
      devDependencies: {
        'fallback-dependencies': '../../../../../../'
      },
      fallbackDependencies: {
        dir: 'lib',
        repos: {
          'fallback-deps-test-repo-15': '../../../../../repos/repo15'
        }
      },
      scripts: {
        postinstall: 'node node_modules/fallback-dependencies/fallback-dependencies.js'
      }
    }
    const repo30PackageLocked = {
      name: 'repo13',
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
          license: 'CC-BY-13.0',
          devDependencies: {}
        },
        'node_modules/fallback-dependencies': {
          resolved: '../../../../..',
          link: true
        }
      }
    }
    const packageList = [[repo13Package, repo13PackageLocked], [repo14Package, repo14PackageLocked], [repo15Package, repo15PackageLocked]]
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
      if (repoList[id] === 'repo13') {
        fs.writeFileSync(`${testSrc}/clones/repo13/reposFile.json`, JSON.stringify(repo13FileData))
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
      if (repoList[id] === 'repo13') {
        fs.rmSync(path.resolve(`${testSrc}/clones/repo14` + '/.git/config'), { recursive: true, force: true })
      }
    }
    fs.mkdirSync(`${testSrc}/repos/repo30`, err => {
      if (err) {
        console.error(err)
      }
      // file written successfully
    })
    try {
      // Change directory path run git command
      execSync('git --bare init', {
        stdio: 'pipe', // hide output from git
        cwd: path.resolve(`${testSrc}/repos/repo30`, '') // where we're cloning the repo to
      })
      // Change directory path run git command
      execSync(`git clone ${testSrc}/repos/repo30`, {
        stdio: 'pipe', // hide output from git
        cwd: path.resolve(`${testSrc}/clones`, '') // where we're cloning the repo to
      })
    } catch (e) {
      console.log(e)
    }
    fs.writeFileSync(`${testSrc}/clones/repo30/package.json`, JSON.stringify(repo30Package))
    fs.writeFileSync(`${testSrc}/clones/repo30/package-lock.json`, JSON.stringify(repo30PackageLocked))

    execSync('npm ci', {
      stdio: 'pipe', // hide output from git
      cwd: path.resolve(`${testSrc}/clones/repo13`, '') // where we're cloning the repo to
    })
    execSync('npm ci', {
      stdio: 'pipe', // hide output from git
      cwd: path.resolve(`${testSrc}/clones/repo13`, '') // where we're cloning the repo to
    })
  } catch {}
}
