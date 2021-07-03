const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
let pkgPath = process.argv[1] // full path of postinstall script being executed, presumably buried in node_modules in your app
pkgPath = pkgPath.split('node_modules')[0] // take only the part preceding node_modules
const pkg = require(pkgPath + 'package.json') // require the package.json in that folder
if (pkg.fallbackDependencies && pkg.fallbackDependencies.repos) { // do nothing if this entry in package.json isn't there
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
  for (const dependency in pkg.fallbackDependencies.repos) {
    let fallbacks = pkg.fallbackDependencies.repos[dependency]
    if (!Array.isArray(fallbacks)) {
      fallbacks = [fallbacks] // coerce to an array of one member if given a string
    }
    for (const i in fallbacks) {
      const url = fallbacks[i]
      try {
        if (fs.existsSync(fallbackDependenciesDir + '/' + dependency)) {
          if (!fs.existsSync(fallbackDependenciesDir + '/' + dependency + '/.git/config')) {
            console.error('Cannot update ' + fallbackDependenciesDir + '/' + dependency + ' because it does not appear to be a git repo!')
            break // move on to next dep
          } else {
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
              console.error('Cannot update ' + fallbackDependenciesDir + '/' + dependency + ' from ' + url + ' because it appears to be a different git repo or from a different remote!')
            }
            continue // try the next fallback
          }
        }
        // not updating, trying a fresh clone
        console.log('Trying to clone ' + url + ' ' + dependency)
        execSync('git clone ' + url + ' ' + dependency, {
          stdio: [0, 1, 2], // display output from git
          cwd: path.resolve(fallbackDependenciesDir, '') // where we're cloning the repo to
        })
        // do npm ci in the new dir only if package-lock exists
        if (fs.existsSync(fallbackDependenciesDir + '/' + dependency + '/package-lock.json')) {
          console.log('Running npm ci on ' + fallbackDependenciesDir + '/' + dependency + '...')
          execSync('npm ci', {
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
