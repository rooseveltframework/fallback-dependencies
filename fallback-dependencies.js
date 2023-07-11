const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
let pkgPath = process.argv[1] // full path of postinstall script being executed, presumably buried in node_modules in your app
pkgPath = pkgPath.split('node_modules')[0] // take only the part preceding node_modules
const pkg = require(pkgPath + 'package.json') // require the package.json in that folder
let reposFile = {}
if (pkg.fallbackDependencies && (pkg.fallbackDependencies.repos || pkg.fallbackDependencies.reposFile)) { // do nothing if these entries in package.json aren't there
  if (!pkg.fallbackDependencies.repos) {
    pkg.fallbackDependencies.repos = {}
  }
  if (pkg.fallbackDependencies.reposFile) {
    try {
      reposFile = require(pkgPath + pkg.fallbackDependencies.reposFile)
    } catch (e) {
      console.error('Could not load fallbackDependencies.reposFile.')
      console.error(e)
    }
  }
  pkg.fallbackDependencies.repos = {
    ...pkg.fallbackDependencies.repos,
    ...reposFile
  }
  let fallbackDependenciesDir = 'fallback_dependencies'
  if (pkg.fallbackDependencies.dir) {
    fallbackDependenciesDir = pkg.fallbackDependencies.dir // set directory to deposit dependencies
  }
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
  for (let dependency in pkg.fallbackDependencies.repos) {
    const fullDep = dependency
    const depFlags = dependency.split(':')
    if (depFlags.length > 1) {
      dependency = depFlags[0]
      if (depFlags[1] === 'directOnly') {
        if (process.env.FALLBACK_DEPENDENCIES_INITIATED_COMMAND) {
          console.log('Skipping ' + dependency + ' because it is not a direct dependency.')
          continue
        }
      }
    }
    let fallbacks = pkg.fallbackDependencies.repos[fullDep]
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
                execSync('git pull', {
                  stdio: [0, 1, 2], // display output from git
                  cwd: path.resolve(fallbackDependenciesDir + '/' + dependency, '')
                })
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
                const output = execSync('git describe --tags', {
                  cwd: path.resolve(fallbackDependenciesDir + '/' + dependency, '')
                })
                if (output.toString().trim() === version) {
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
        execSync('git clone ' + url + ' ' + dependency, {
          stdio: [0, 1, 2], // display output from git
          cwd: path.resolve(fallbackDependenciesDir, '') // where we're cloning the repo to
        })
        // do npm ci in the new dir only if package-lock exists and the don't install deps flag is not set
        if (fs.existsSync(fallbackDependenciesDir + '/' + dependency + '/package-lock.json') && !skipDeps) {
          console.log('Running npm ci on ' + fallbackDependenciesDir + '/' + dependency + '...')
          execSync('cross-env FALLBACK_DEPENDENCIES_INITIATED_COMMAND=true npm ci', {
            stdio: [0, 1, 2], // display output from git
            cwd: path.resolve(fallbackDependenciesDir + '/' + dependency, '')
          })
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