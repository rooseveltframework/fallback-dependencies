module.exports = fallbackDependancySandBox

function fallbackDependancySandBox (appDir) {
  const fs = require('fs')
  const path = require('path')
  const testSrc = path.resolve(__dirname, '../../test')
  const { execSync } = require('child_process')
  const repoList = ['repo1', 'repo2', 'repo3', 'repo4', 'repo5', 'repo6', 'repo7', 'repo8',
    'repo9', 'repo10', 'repo11', 'repo12', 'repo19', 'repo20', 'repo21'
  ]

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
          'fallback-deps-test-repo-3': '../../../../../repos/repo3'
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
    const repo4Package = {
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
    const repo4FileData = {
      'fallback-deps-test-repo-5': [
        '../../../repos/repo5'
      ]
    }
    const repo5Package = {
      devDependencies: {
        'fallback-dependencies': '../../../../../'
      },
      fallbackDependencies: {
        dir: 'lib',
        repos: {
          'fallback-deps-test-repo-6': ['../../../../../repos/repo6', '../../../../../repos/repo6']
        },
        // misspell file name to cover lines 15-18
        reposFile: 'reposFil.json'
      },
      scripts: {
        postinstall: 'node node_modules/fallback-dependencies/fallback-dependencies.js'
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
    const repo7Package = {
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
    const repo7PackageLocked = {
      name: 'repo7',
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
          license: 'CC-BY-7.0',
          devDependencies: {}
        },
        'node_modules/fallback-dependencies': {
          resolved: '../../..',
          link: true
        }
      }
    }
    const repo7FileData = {
      'fallback-deps-test-repo-8': [
        '../../../repos/repo8'
      ]
    }
    const repo8Package = {
      devDependencies: {
        'fallback-dependencies': '../../../../../'
      },
      fallbackDependencies: {
        dir: 'lib',
        repos: {
          'fallback-deps-test-repo-9:directOnly': '../../../../../repos/repo9'
        },
        reposFile: 'reposFile.json'
      },
      scripts: {
        postinstall: 'node node_modules/fallback-dependencies/fallback-dependencies.js'
      }
    }
    const repo8PackageLocked = {
      name: 'repo7',
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
          license: 'CC-BY-7.0',
          devDependencies: {}
        },
        'node_modules/fallback-dependencies': {
          resolved: '../../../../..',
          link: true
        }
      }
    }
    const repo9Package = {}
    const repo9PackageLocked = {
      name: 'repo9',
      lockfileVersion: 3,
      requires: true,
      packages: {}
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
        '../../../repos/repo11', 'git://github.com/rooseveltframework/roosevelt.git'
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
        }
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
        const repo19Package = {
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
    const repo19PackageLocked = {
      name: 'repo19',
      lockfileVersion: 3,
      requires: true,
      packages: {
        '': {
          hasInstallScript: true,
          devDependencies: {
            'fallback-dependencies': '../../..'
          }
        },
        '../../..': {
          version: '0.1.0',
          dev: true,
          license: 'CC-BY-19.0',
          devDependencies: {}
        },
        'node_modules/fallback-dependencies': {
          resolved: '../../..',
          link: true
        }
      }
    }
    const repo19FileData = {
      'fallback-deps-test-repo-20': [
        'https://github.com/rooseveltframework/generator-roosevelt.git -b 0.21.7', 'https://githu.com/rooseveltframework/roosevelt.git -b 0.21.12'
      ]
    }
    const repo20Package = {
      devDependencies: {
        'fallback-dependencies': '../../../../../../'
      },
      fallbackDependencies: {
        dir: 'lib',
        repos: {
          'fallback-deps-test-repo-21': '../../../../../repos/repo21'
        }
      },
      scripts: {
        postinstall: 'node node_modules/fallback-dependencies/fallback-dependencies.js'
      }
    }
    const repo20PackageLocked = {
      name: 'repo19',
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
          license: 'CC-BY-19.0',
          devDependencies: {}
        },
        'node_modules/fallback-dependencies': {
          resolved: '../../../../..',
          link: true
        }
      }
    }
    const repo21Package = {}
    const repo21PackageLocked = {
      name: 'repo21',
      lockfileVersion: 3,
      requires: true,
      packages: {}
    }
    const packageList = [
      [repo1Package, repo1PackageLocked], [repo2Package, repo2PackageLocked], [repo3Package, repo3PackageLocked], [repo4Package, repo4PackageLocked], [repo5Package, repo5PackageLocked], [repo6Package, repo6PackageLocked],
      [repo7Package, repo7PackageLocked], [repo8Package, repo8PackageLocked], [repo9Package, repo9PackageLocked], [repo10Package, repo10PackageLocked], [repo11Package, repo11PackageLocked], [repo12Package, repo12PackageLocked],
      [repo19Package, repo19PackageLocked], [repo20Package, repo20PackageLocked], [repo21Package, repo21PackageLocked]
    ]
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

      if (repoList[id] === 'repo1') {
        fs.mkdirSync(`${testSrc}/clones/repo1/lib`)
      }
      if (repoList[id] === 'repo4') {
        fs.writeFileSync(`${testSrc}/clones/repo4/reposFile.json`, JSON.stringify(repo4FileData))
        fs.mkdirSync(`${testSrc}/clones/repo4/lib`)
      }
      if (repoList[id] === 'repo7') {
        fs.writeFileSync(`${testSrc}/clones/repo7/reposFile.json`, JSON.stringify(repo7FileData))
      }
      if (repoList[id] === 'repo10') {
        fs.writeFileSync(`${testSrc}/clones/repo10/reposFile.json`, JSON.stringify(repo10FileData))
      }
      if (repoList[id] === 'repo19') {
        fs.writeFileSync(`${testSrc}/clones/repo19/reposFile.json`, JSON.stringify(repo19FileData))
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

    execSync('npm ci', {
      stdio: 'pipe', // hide output from git
      cwd: path.resolve(`${testSrc}/clones/repo1`, '') // where we're cloning the repo to
    })
    execSync('npm ci', {
      stdio: 'pipe', // hide output from git
      cwd: path.resolve(`${testSrc}/clones/repo1`, '') // where we're cloning the repo to
    })
    execSync('npm ci', {
      stdio: 'pipe', // hide output from git
      cwd: path.resolve(`${testSrc}/clones/repo4`, '') // where we're cloning the repo to
    })
    execSync('npm ci', {
      stdio: 'pipe', // hide output from git
      cwd: path.resolve(`${testSrc}/clones/repo7`, '') // where we're cloning the repo to
    })
    execSync('npm ci', {
      stdio: 'pipe', // hide output from git
      cwd: path.resolve(`${testSrc}/clones/repo10`, '') // where we're cloning the repo to
    })
    execSync('npm ci', {
      stdio: 'pipe', // hide output from git
      cwd: path.resolve(`${testSrc}/clones/repo10`, '') // where we're cloning the repo to
    })
    execSync('npm ci', {
      stdio: 'pipe', // hide output from git
      cwd: path.resolve(`${testSrc}/clones/repo19`, '') // where we're cloning the repo to
    })
    execSync('npm ci', {
      stdio: 'pipe', // hide output from git
      cwd: path.resolve(`${testSrc}/clones/repo19`, '') // where we're cloning the repo to
    })
  } catch {}
}