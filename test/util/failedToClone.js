module.exports = (listType) => {
  const fs = require('fs')
  const path = require('path')
  const { spawnSync } = require('child_process')
  const testSrc = path.resolve(__dirname, '../../test')

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
    const repo1FileData = {
      'fallback-deps-test-repo-2': [
        'failed',
        'test'
      ]
    }

    // initialize repos
    if (!fs.existsSync(`${testSrc}/repos/repo1/`)) fs.mkdirSync(`${testSrc}/repos/repo1/`)
    spawnSync('git', ['--bare', 'init'], {
      shell: false,
      stdio: 'pipe', // hide output from git
      cwd: path.normalize(`${testSrc}/repos/repo1`, '') // where we're cloning the repo to
    })
    spawnSync('git', ['clone', `${testSrc}/repos/repo1`], {
      shell: false,
      stdio: 'pipe', // hide output from git
      cwd: path.normalize(`${testSrc}/clones`, '') // where we're cloning the repo to
    })
    fs.writeFileSync(`${testSrc}/clones/repo1/reposFile.json`, JSON.stringify(repo1FileData))
    fs.writeFileSync(`${testSrc}/clones/repo1/package.json`, JSON.stringify(repo1Package))
    fs.writeFileSync(`${testSrc}/clones/repo1/package-lock.json`, JSON.stringify(repo1PackageLock))
    spawnSync('git', ['add', '.'], {
      shell: false,
      stdio: 'pipe', // hide output from git
      cwd: path.normalize(`${testSrc}/clones/repo1`, '') // where we're cloning the repo to
    })
    spawnSync('git', ['commit', '-m', '"commit"'], {
      shell: false,
      stdio: 'pipe', // hide output from git
      cwd: path.normalize(`${testSrc}/clones/repo1`, '') // where we're cloning the repo to
    })
    spawnSync('git', ['push'], {
      shell: false,
      stdio: 'pipe', // hide output from git
      cwd: path.normalize(`${testSrc}/clones/repo1`, '') // where we're cloning the repo to
    })

    spawnSync('npm', ['ci'], {
      shell: false,
      stdio: 'pipe', // hide output from git
      cwd: path.normalize(`${testSrc}/clones/repo1`, '') // where we're cloning the repo to
    })
  } catch {}
}
