const fs = require('fs')
const path = require('path')
const { spawnSync, spawn } = require('child_process')
let pkgPath = process.argv[1] // full path of postinstall script being executed, presumably buried in node_modules in your app
pkgPath = pkgPath.split('node_modules')[0] // take only the part preceding node_modules
const pkg = require(pkgPath + 'package.json') // require the package.json in that folder

function executeFallbackList (listType) {
  // sanity check that git actually works
  const gitProcess = spawn('git', [], {
    shell: false,
    stdio: ['pipe', 'pipe', 'pipe'] // hide all output from this sanity check command from the console
  })

  let output = ''
  let error = ''

  gitProcess.stdout.on('data', (data) => {
    output += data.toString()
  })

  gitProcess.stderr.on('data', (data) => {
    error += data.toString()
  })

  const timeout = setTimeout(() => {
    gitProcess.kill()
    console.error('Process killed due to timeout.')
  }, 5000)

  gitProcess.on('close', (code) => {
    clearTimeout(timeout)
    if (code !== 1) { // git's help messages exit with code 1
      if (output) console.log(output)
      if (error) console.error(error)
      throw new Error(`git process failed with code ${code}`)
    }

    let reposFile = {}
    if (pkg[listType] && (pkg[listType].repos || pkg[listType].reposFile)) { // do nothing if these entries in package.json aren't there
      if (!pkg[listType].repos) pkg[listType].repos = {}
      if (pkg[listType].reposFile) {
        try {
          reposFile = require(pkgPath + pkg[listType].reposFile)
        } catch (e) {
          console.error('Could not load fallbackDependencies.reposFile.')
          console.error(e)
        }
      }
      pkg[listType].repos = {
        ...pkg[listType].repos,
        ...reposFile
      }
      if (process.env.FALLBACK_DEPENDENCIES_PREFERRED_WILDCARD) {
        for (const key in pkg[listType].repos) {
          const urls = pkg[listType].repos[key]
          for (let i = 0; i < urls.length; i++) {
            if (urls[i].includes(process.env.FALLBACK_DEPENDENCIES_PREFERRED_WILDCARD)) {
              const url = urls[i]
              urls.splice(i, 1)
              urls.unshift(url)
              break
            }
          }
        }
      }
      let fallbackDependenciesDir = 'fallback_dependencies'
      if (pkg[listType].dir) fallbackDependenciesDir = pkg[listType].dir // set directory to deposit dependencies
      try {
        fs.mkdirSync(pkgPath + fallbackDependenciesDir) // make the directory to deposit deps to
      } catch (e) {
        if (e.code === 'EEXIST') {
          // do nothing if it exists already
        } else {
          // log the error if it erred for some other reason
          console.error(e)
          process.exit(1)
        }
      }
      for (let dependency in pkg[listType].repos) {
        const fullDep = dependency
        const depFlags = dependency.split(':')
        if (depFlags.length > 1) {
          dependency = depFlags[0]
          if (listType === 'fallbackDependencies' || depFlags[1] === 'directOnly') {
            if (process.env.FALLBACK_DEPENDENCIES_INITIATED_COMMAND) {
              console.log('Skipping ' + dependency + ' because it is not a direct dependency.')
              continue
            }
          }
        }
        let fallbacks = pkg[listType].repos[fullDep]
        if (!Array.isArray(fallbacks)) {
          fallbacks = [fallbacks] // coerce to an array of one member if given a string
        }
        for (const i in fallbacks) {
          let url = fallbacks[i]
          let skipDeps = false
          if (url.slice(-11) === ' -skip-deps') {
            url = url.slice(0, -11)
            skipDeps = true
          }
          try {
            if (fs.existsSync(fallbackDependenciesDir + '/' + dependency)) {
              if (!fs.existsSync(fallbackDependenciesDir + '/' + dependency + '/.git/config')) {
                console.error('Cannot update ' + fallbackDependenciesDir + '/' + dependency + ' because it does not appear to be a git repo!')
                break // move on to next dep
              } else {
                let reClone = false
                // scan .git/config to see if `url` exists within it
                if (fs.readFileSync(fallbackDependenciesDir + '/' + dependency + '/.git/config', 'utf8').search(url) > 0) {
                  // update only if it's a direct match — same repo from the same place
                  console.log('Running git pull on ' + fallbackDependenciesDir + '/' + dependency + '...')
                  try {
                    const output = spawnSync('git', ['pull'], {
                      shell: false,
                      stdio: [0, 1, 2], // display output from git
                      cwd: path.resolve(fallbackDependenciesDir + '/' + dependency, '')
                    })
                    if (output.status !== 0) throw output
                  } catch (e) {
                    console.error('Cannot update ' + fallbackDependenciesDir + '/' + dependency + ' from ' + url + ' because of a git pull error!')
                  }
                  break // stop checking fallbacks
                } else {
                  const parts = url.split(' ')
                  if (parts.includes('-b')) {
                    let version = ''
                    for (const key in parts) {
                      const part = parts[key]
                      if (part === '-b') {
                        version = parts[parseInt(key) + 1]
                        break
                      }
                    }
                    const output = spawnSync('git', ['describe', '--tags'], {
                      shell: false,
                      cwd: path.resolve(fallbackDependenciesDir + '/' + dependency, '')
                    })
                    if (output.status !== 0) throw output
                    if (output.stdout.toString().trim() === version) {
                      console.log('Already up to date: ' + fallbackDependenciesDir + '/' + dependency + ' from ' + url + ' is already up to date because the commit\'s git tag matches the desired -b version number.')
                      break // stop checking fallbacks
                    } else {
                      console.log('Removing ' + fallbackDependenciesDir + '/' + dependency + ' from ' + url + ' because the commit\'s git tag does not match the desired -b version number. It will be re-cloned.')
                      fs.rmSync(path.resolve(fallbackDependenciesDir + '/' + dependency, ''), { recursive: true, force: true })
                      reClone = true
                    }
                  } else {
                    console.error('Cannot update ' + fallbackDependenciesDir + '/' + dependency + ' from ' + url + ' because it appears to be a different git repo or from a different remote!')
                  }
                }
                if (!reClone) {
                  continue // try the next fallback
                }
              }
            }
            // not updating, trying a fresh clone
            console.log('Trying to clone ' + url + ' ' + dependency)
            const args = ['clone']
            args.push.apply(args, url.split(' '))
            args.push.apply(args, dependency.split(' '))
            const output = spawnSync('git', args, {
              shell: false,
              stdio: [0, 1, 2], // display output from git
              cwd: path.resolve(fallbackDependenciesDir, '') // where we're cloning the repo to
            })
            if (output.status !== 0) throw output
            // do npm ci in the new dir only if package-lock exists and the don't install deps flag is not set
            if (fs.existsSync(fallbackDependenciesDir + '/' + dependency + '/package-lock.json') && !skipDeps) {
              console.log('Running npm ci on ' + fallbackDependenciesDir + '/' + dependency + '...')
              const args = ['ci']
              if (listType === 'fallbackDependencies') args.push('--omit=dev')
              const output = spawnSync('npm', args, {
                env: Object.assign(process.env, {
                  FALLBACK_DEPENDENCIES_INITIATED_COMMAND: true
                }),
                shell: true, // necessary to get npm in windows' PATH
                stdio: [0, 1, 2], // display output from git
                cwd: path.resolve(fallbackDependenciesDir + '/' + dependency, '')
              })
              if (output.status !== 0) {
                console.error(output)
                console.error(`Fatal error: unable to install dependencies for: ${dependency}`)
              }
            }
            break // if it successfully clones, skip trying the fallback
          } catch (e) {
            if (fallbacks.length === (parseInt(i) + 1)) {
              console.error('Unable to resolve dependency ' + dependency + ' — all fallbacks failed to clone!\n')
            } else {
              console.log('Trying fallback...')
            }
          }
        }
      }
    }
  })
}

executeFallbackList('fallbackDevDependencies')
executeFallbackList('fallbackDependencies')
