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
        if (pkg.fallbackDependencies.overwrite) {
          let replace = true
          if (fs.existsSync(fallbackDependenciesDir + '/' + dependency)) {
            if (!fs.existsSync(fallbackDependenciesDir + '/' + dependency + '/.git/config')) {
              console.error('Cannot replace ' + dependency + ' because it does not appear to be a git repo!')
              replace = false
            } else {
              // scan .git/config to see if `url` exists within it
              if (fs.readFileSync(fallbackDependenciesDir + '/' + dependency + '/.git/config', 'utf8').search(url) > 0) {
                replace = true // replace only if it's a direct match — same repo from the same place
              } else {
                console.error('Cannot replace ' + dependency + ' from ' + url + ' because it appears to be a different git repo or from a different remote!')
                replace = false
              }
            }
          }
          if (replace) {
            try {
              // TODO: rename rather than remove, only remove once successful clone occurs
              fs.rmSync(fallbackDependenciesDir + '/' + dependency, { recursive: true, force: true })
            } catch (e) {
              // do nothing if an exception occurs while trying to remove the old folder
            }
          }
        }
        console.log('Trying to clone ' + url + ' ' + dependency)
        execSync('git clone ' + url + ' ' + dependency, {
          stdio: [0, 1, 2], // display output from git
          cwd: path.resolve(fallbackDependenciesDir, '') // where we're cloning the repo to
        })
        console.log() // new line
        // TODO: do npm ci in the new dir only if package-lock exists
        // TODO: also add a feature to do manual updates by CDing into dirs and doing a git pull
        console.log() // new line
        break // if it successfully clones, skip trying the fallback
      } catch (e) {
        if (fallbacks.length === (parseInt(i) + 1)) {
          console.error('Unable to resolve depenendency ' + dependency + ' — all fallbacks failed to clone!\n')
        } else {
          console.log('Trying fallback...')
        }
      }
    }
  }
}
