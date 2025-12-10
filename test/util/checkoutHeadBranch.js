module.exports = (listType) => {
  const fs = require('fs')
  const path = require('path')
  const { spawnSync } = require('child_process')
  const testSrc = path.resolve(__dirname, '../../test')
  const repoList = ['repo1', 'repo2', 'repo3']

  try {
    fs.rmSync(path.join(__dirname, './clones'), { recursive: true, force: true })
    fs.rmSync(path.join(__dirname, './repos'), { recursive: true, force: true })
    if (!fs.existsSync(`${testSrc}/repos`)) fs.mkdirSync(`${testSrc}/repos`)
    if (!fs.existsSync(`${testSrc}/clones`)) fs.mkdirSync(`${testSrc}/clones`)

    const repo1Package = {
      dependencies: {
        'fallback-dependencies': '../../../'
      },
      scripts: {
        postinstall: 'node node_modules/fallback-dependencies/fallback-dependencies.js'
      }
    }
    repo1Package[listType] = {
      dir: 'lib',
      reposFile: 'reposFile.json'
    }
    const repo1PackageLock = {
      name: 'repo1',
      lockfileVersion: 3,
      requires: true,
      packages: {
        '': {
          hasInstallScript: true,
          dependencies: {
            'fallback-dependencies': '../../..'
          }
        },
        '../../..': {
          version: '0.1.0',
          license: 'CC-BY-1.0',
          dependencies: {}
        },
        'node_modules/fallback-dependencies': {
          resolved: '../../..',
          link: true
        }
      }
    }
    let repo1FileData = {
      'fallback-deps-test-repo-2': [
        '../../../repos/repo2'
      ]
    }
    const repo2Package = {
      dependencies: {
        'fallback-dependencies': '../../../../../'
      },
      scripts: {
        postinstall: 'node node_modules/fallback-dependencies/fallback-dependencies.js'
      }
    }
    repo2Package[listType] = {
      dir: 'lib',
      repos: {
        'fallback-deps-test-repo-3:': '../../../../../repos/repo3'
      }
    }
    const repo2PackageLock = {
      name: 'repo2',
      lockfileVersion: 3,
      requires: true,
      packages: {
        '': {
          hasInstallScript: true,
          dependencies: {
            'fallback-dependencies': '../../../../..'
          }
        },
        '../../../../..': {
          version: '0.1.0',
          license: 'CC-BY-1.0',
          dependencies: {}
        },
        'node_modules/fallback-dependencies': {
          resolved: '../../../../..',
          link: true
        }
      }
    }
    const repo3Package = {}
    const repo3PackageLock = {
      name: 'repo3',
      lockfileVersion: 3,
      requires: true,
      packages: {}
    }

    // initialize repos
    const packageList = [[repo1Package, repo1PackageLock], [repo2Package, repo2PackageLock], [repo3Package, repo3PackageLock]]
    for (const id in repoList) {
      if (!fs.existsSync(`${testSrc}/repos/${repoList[id]}/`)) fs.mkdirSync(`${testSrc}/repos/${repoList[id]}/`)
      spawnSync('git', ['--bare', 'init'], {
        shell: false,
        stdio: 'pipe', // hide output from git
        cwd: path.normalize(`${testSrc}/repos/${repoList[id]}`, '') // where we're cloning the repo to
      })
      spawnSync('git', ['clone', `${testSrc}/repos/${repoList[id]}`], {
        shell: false,
        stdio: 'pipe', // hide output from git
        cwd: path.normalize(`${testSrc}/clones`, '') // where we're cloning the repo to
      })
      if (repoList[id] === 'repo1') fs.writeFileSync(`${testSrc}/clones/repo1/reposFile.json`, JSON.stringify(repo1FileData))
      fs.writeFileSync(`${testSrc}/clones/${repoList[id]}/package.json`, JSON.stringify(packageList[id][0]))
      fs.writeFileSync(`${testSrc}/clones/${repoList[id]}/package-lock.json`, JSON.stringify(packageList[id][1]))
      spawnSync('git', ['add', '.'], {
        shell: false,
        stdio: 'pipe', // hide output from git
        cwd: path.normalize(`${testSrc}/clones/${repoList[id]}`, '') // where we're cloning the repo to
      })
      spawnSync('git', ['commit', '-m', '"commit"'], {
        shell: false,
        stdio: 'pipe', // hide output from git
        cwd: path.normalize(`${testSrc}/clones/${repoList[id]}`, '') // where we're cloning the repo to
      })
      spawnSync('git', ['push'], {
        shell: false,
        stdio: 'pipe', // hide output from git
        cwd: path.normalize(`${testSrc}/clones/${repoList[id]}`, '') // where we're cloning the repo to
      })
    }

    // add 1.0.0 tag and attempt to clone repo while specifying it
    spawnSync('git', ['tag', '1.0.0'], {
      shell: false,
      stdio: 'pipe', // hide output from git
      cwd: path.normalize(`${testSrc}/clones/repo2`, '') // where we're cloning the repo to
    })
    spawnSync('git', ['push', '--tags'], {
      shell: false,
      stdio: 'pipe', // hide output from git
      cwd: path.normalize(`${testSrc}/clones/repo2`, '') // where we're cloning the repo to
    })
    repo1FileData = {
      'fallback-deps-test-repo-2': [
        '../../../repos/repo2 -b 1.0.0'
      ]
    }
    fs.writeFileSync(`${testSrc}/clones/repo1/reposFile.json`, JSON.stringify(repo1FileData))
    spawnSync('npm', ['ci'], {
      shell: false,
      stdio: 'pipe', // hide output from git
      cwd: path.normalize(`${testSrc}/clones/repo1`, '') // where we're cloning the repo to
    })

    // attempt to clone repo
    repo1FileData = {
      'fallback-deps-test-repo-2': [
        '../../../repos/repo2'
      ]
    }
    fs.writeFileSync(`${testSrc}/clones/repo1/reposFile.json`, JSON.stringify(repo1FileData))
    spawnSync('npm', ['ci'], {
      shell: false,
      stdio: 'pipe', // hide output from git
      cwd: path.normalize(`${testSrc}/clones/repo1`, '') // where we're cloning the repo to
    })
  } catch {}
}
