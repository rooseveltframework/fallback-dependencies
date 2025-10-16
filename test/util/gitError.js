module.exports = (listType) => {
  const fs = require('fs')
  const path = require('path')
  const os = require('os')
  const { spawnSync } = require('child_process')
  const testSrc = path.resolve(__dirname, '../../test')
  const repoList = ['repo1', 'repo2', 'repo3']
  const command = os.platform() === 'win32' ? 'where' : 'which'
  const splitPath = os.platform() === 'win32' ? process.env.PATH.split(';') : process.env.PATH.split(':')

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
      repos: {
        'fallback-deps-test-repo-2': [
          '../../../repos/repo2'
        ]
      }
    }
    const repo1PackageLock = {
      name: 'repo1',
      lockfileVersion: 3,
      requires: true,
      packages: {
        '': {
          hasInstallScript: true,
          dependencies: {
            'fallback-dependencies': '../../../'
          }
        },
        '../../..': {
          version: '0.1.0',
          license: 'CC-BY-4.0',
          dependencies: {}
        },
        'node_modules/fallback-dependencies': {
          resolved: '../../..',
          link: true
        }
      }
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
        'fallback-deps-test-repo-3': '../../../../../repos/repo3'
      }
    }
    const repo2PackageLock = {
      name: 'repo1',
      lockfileVersion: 3,
      requires: true,
      packages: {
        '': {
          hasInstallScript: true,
          dependencies: {
            'fallback-dependencies': '../../../../../'
          }
        },
        '../../../../..': {
          version: '0.1.0',
          license: 'CC-BY-4.0',
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

    // remove git from PATH
    const gitPath = spawnSync(command, ['-a', 'git'], { shell: false })
    const gitPathArr = gitPath.stdout.toString().trim().split('\n')
    for (let i = 0; i < gitPathArr.length; i++) {
      const splitGitPath = os.platform() === 'win32' ? gitPathArr[i].split('\\') : gitPathArr[i].split('/')
      splitGitPath.splice(splitGitPath.length - 1, 1)
      const joinGitPath = os.platform() === 'win32' ? splitGitPath.join('\\') : splitGitPath.join('/')
      for (let j = 0; j < splitPath.length; j++) {
        if (splitPath[j] === joinGitPath) splitPath.splice(j, 1)
      }
    }

    // make sure nodejs wasn't removed from PATH
    const nodePath = spawnSync(command, ['-a', 'node'], { shell: false })
    const nodePathArr = nodePath.stdout.toString().trim().split('\n')
    let nodeExists
    for (let i = 0; i < nodePathArr.length; i++) {
      const splitNodePath = os.platform() === 'win32' ? nodePathArr[i].split('\\') : nodePathArr[i].split('/')
      splitNodePath.splice(splitNodePath.length - 1, 1)
      const joinNodePath = os.platform() === 'win32' ? splitNodePath.join('\\') : splitNodePath.join('/')
      for (let j = 0; j < splitPath.length; j++) {
        if (splitPath[j] === joinNodePath) {
          nodeExists = true
          break
        }
      }
    }
    if (!nodeExists) splitPath.push(nodePath[0])

    const joinPathNoGit = os.platform() === 'win32' ? splitPath.join(';') : splitPath.join(':')
    process.env.PATH = joinPathNoGit

    const output = spawnSync('npm', ['ci'], {
      shell: false,
      stdio: 'pipe', // hide output from git
      cwd: path.normalize(`${testSrc}/clones/repo1`, '') // where we're cloning the repo to
    })

    return output.stderr.toString()
  } catch {}
}
