const fs = require('fs')
const path = require('path')
const Logger = require('roosevelt-logger')
const logger = new Logger()
const { spawnSync, spawn } = require('child_process')
let pkgPath = process.argv[1] // full path of postinstall script being executed, presumably buried in node_modules in your app
pkgPath = pkgPath.split('node_modules')[0] // take only the part preceding node_modules
const pkg = require(pkgPath + 'package.json') // require the package.json in that folder

function executeFallbackList (listTypes) {
  // sanity check that git actually works
  const gitProcess = spawn('git', [], {
    shell: false,
    stdio: ['pipe', 'pipe', 'pipe'] // hide all output from this sanity check command from the console
  })

  let error = ''

  gitProcess.on('error', (err) => {
    error += err.toString()
  })

  const timeout = setTimeout(() => {
    gitProcess.kill()
    logger.error('Process killed due to timeout.')
  }, 5000)

  gitProcess.on('close', async (code) => {
    clearTimeout(timeout)
    if (code !== 1) { // git's help messages exit with code 1
      if (error) logger.error(error)
      throw new Error(`git process failed with code ${code}`)
    }

    for (const listType of listTypes) {
      let reposFile = {}
      if (pkg[listType] && (pkg[listType].repos || pkg[listType].reposFile)) { // do nothing if these entries in package.json aren't there
        if (!pkg[listType].repos) pkg[listType].repos = {}
        if (pkg[listType].reposFile) {
          try {
            reposFile = require(pkgPath + pkg[listType].reposFile)
          } catch (e) {
            logger.error('Could not load fallbackDependencies.reposFile.')
            logger.error(e)
          }
        }
        pkg[listType].repos = {
          ...pkg[listType].repos,
          ...reposFile
        }
        if (process.env.FALLBACK_DEPENDENCIES_PREFERRED_WILDCARD || pkg[listType].preferredWildcard) {
          const preferredWildcard = process.env.FALLBACK_DEPENDENCIES_PREFERRED_WILDCARD ? process.env.FALLBACK_DEPENDENCIES_PREFERRED_WILDCARD : pkg[listType].preferredWildcard
          for (const key in pkg[listType].repos) {
            const urls = pkg[listType].repos[key]
            for (let i = 0; i < urls.length; i++) {
              if (urls[i].includes(preferredWildcard)) {
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
            logger.error(e)
            process.exit(1)
          }
        }
        const failedDependencies = []
        let failedToClone = 0
        for (let dependency in pkg[listType].repos) {
          const fullDep = dependency
          const depFlags = dependency.split(':')
          if (depFlags.length > 1) {
            dependency = depFlags[0]
            if (listType === 'fallbackDependencies' || depFlags[1] === 'directOnly') {
              if (process.env.FALLBACK_DEPENDENCIES_INITIATED_COMMAND) {
                logger.log('Skipping ' + dependency + ' because it is not a direct dependency.')
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
            const rerunNpmCi = process.env.FALLBACK_DEPENDENCIES_RERUN_NPM_CI || pkg[listType].rerunNpmCi
            let reClone = false
            let updatedDep = false
            let skipDeps = false
            if (url.slice(-11) === ' -skip-deps') {
              url = url.slice(0, -11)
              skipDeps = true
            }
            try {
              if (fs.existsSync(fallbackDependenciesDir + '/' + dependency)) {
                if (!fs.existsSync(fallbackDependenciesDir + '/' + dependency + '/.git/config')) {
                  logger.error('Cannot update ' + fallbackDependenciesDir + '/' + dependency + ' because it does not appear to be a git repo!')
                  break // move on to next dep
                } else {
                  // scan .git/config to see if `url` exists within it
                  if (fs.readFileSync(fallbackDependenciesDir + '/' + dependency + '/.git/config', 'utf8').search(url) > 0) {
                    // update only if it's a direct match — same repo from the same place
                    logger.log('Running git pull on ' + fallbackDependenciesDir + '/' + dependency + '...')
                    try {
                      const output = spawnSync('git', ['pull'], {
                        shell: false,
                        stdio: [0, 1, 2], // display output from git
                        cwd: path.resolve(fallbackDependenciesDir + '/' + dependency, '')
                      })
                      if (output.status !== 0) throw output.stderr.toString()
                      updatedDep = true
                    } catch (e) {
                      logger.error('Cannot update ' + fallbackDependenciesDir + '/' + dependency + ' from ' + url + ' because of a git pull error!')
                      logger.error(e)
                    }
                  } else {
                    const parts = url.split(' ')
                    if (parts.includes('-b')) {
                      if (!parts.some(url => fs.readFileSync(fallbackDependenciesDir + '/' + dependency + '/.git/config', 'utf8').includes(url))) {
                        logger.log('Removing ' + fallbackDependenciesDir + '/' + dependency + ' from ' + url + ' because a different git url was supplied. It will be re-cloned.')
                        fs.rmSync(path.resolve(fallbackDependenciesDir + '/' + dependency, ''), { recursive: true, force: true })
                        reClone = true
                      } else {
                        let version = ''
                        for (const key in parts) {
                          const part = parts[key]
                          if (part === '-b') {
                            version = parts[parseInt(key) + 1]
                            break
                          }
                        }
                        const output = spawnSync('git', ['tag'], { // get list of tags
                          shell: false,
                          cwd: path.resolve(fallbackDependenciesDir + '/' + dependency, '')
                        })
                        if (output.status !== 0) throw output.stderr.toString()
                        if (output.stdout.toString().split('\n').includes(version)) { // version supplied is a valid tag
                          const tag = spawnSync('git', ['describe', '--tags'], { // get nearest tag
                            shell: false,
                            cwd: path.resolve(fallbackDependenciesDir + '/' + dependency, '')
                          })
                          if (tag.stdout.toString().trim() === version) { // up to date with supplied tag
                            logger.log('Already up to date: ' + fallbackDependenciesDir + '/' + dependency + ' from ' + url + ' is already up to date because the commit\'s git tag matches the desired -b version number.')
                            if (!rerunNpmCi) break // stop checking fallbacks
                          } else { // version supplied is a valid tag, but differs from current tag
                            const fetch = spawnSync('git', ['fetch', '--tags'], {
                              shell: false,
                              cwd: path.resolve(fallbackDependenciesDir + '/' + dependency, '')
                            })
                            if (fetch.status !== 0) throw fetch.stderr.toString()
                            const checkout = spawnSync('git', ['checkout', version], {
                              shell: false,
                              cwd: path.resolve(fallbackDependenciesDir + '/' + dependency, '')
                            })
                            if (checkout.status !== 0) throw checkout.stderr.toString()
                            logger.log(`Successfully checked out tag ${version}.`)
                            updatedDep = true
                          }
                        } else { // version supplied is not a tag
                          const remote = spawnSync('git', ['remote'], {
                            shell: false,
                            cwd: path.resolve(fallbackDependenciesDir + '/' + dependency, '')
                          })
                          const fetch = spawnSync('git', ['fetch', remote.stdout.toString().trim()], {
                            shell: false,
                            cwd: path.resolve(fallbackDependenciesDir + '/' + dependency, '')
                          })
                          if (fetch.status !== 0) throw fetch.stderr.toString()
                          const commitsBehind = spawnSync('git', ['rev-list', '--count', `HEAD..${remote.stdout.toString().trim()}/${version}`], {
                            shell: false,
                            cwd: path.resolve(fallbackDependenciesDir + '/' + dependency, '')
                          })
                          if (commitsBehind.status !== 0) {
                            const checkout = spawnSync('git', ['checkout', version], {
                              shell: false,
                              cwd: path.resolve(fallbackDependenciesDir + '/' + dependency, '')
                            })
                            if (checkout.status !== 0) throw checkout.stderr.toString()
                            logger.log(`Successfully checked out commit ${version}.`)
                            updatedDep = true
                          } else if (commitsBehind.stdout.toString() > 0) { // git pull if behind
                            logger.log('There are new commits available.')
                            logger.log('Running git pull on ' + fallbackDependenciesDir + '/' + dependency + '...')
                            const pull = spawnSync('git', ['pull', remote.stdout.toString().trim(), version], {
                              shell: false,
                              cwd: path.resolve(fallbackDependenciesDir + '/' + dependency, '')
                            })
                            if (pull.status !== 0) throw pull.stderr.toString()
                            updatedDep = true
                          } else {
                            logger.log('Already up to date: ' + fallbackDependenciesDir + '/' + dependency + ' from ' + url + ' is already up to date because the commit\'s branch name matches the desired -b branch name.')
                            if (!rerunNpmCi) break // stop checking fallbacks
                          }
                        }
                      }
                    } else {
                      logger.error('Cannot update ' + fallbackDependenciesDir + '/' + dependency + ' from ' + url + ' because it appears to be a different git repo or from a different remote!')
                    }
                  }
                  if (!reClone && !rerunNpmCi && !updatedDep) continue // try the next fallback
                }
              }
              if (reClone || !fs.existsSync(fallbackDependenciesDir + '/' + dependency)) {
                // not updating, trying a fresh clone
                logger.log('Trying to clone ' + url + ' ' + dependency)
                const args = ['clone']
                args.push.apply(args, url.split(' '))
                args.push.apply(args, dependency.split(' '))
                const output = spawnSync('git', args, {
                  shell: false,
                  stdio: [0, 1, 2], // display output from git
                  cwd: path.resolve(fallbackDependenciesDir, '') // where we're cloning the repo to
                })
                if (output.status !== 0) {
                  if (args.includes('-b')) {
                    let version = ''
                    for (const key in args) {
                      const part = args[key]
                      if (part === '-b') {
                        version = args[parseInt(key) + 1]
                        args.splice(key, 2)
                        break
                      }
                    }
                    const cloneUrl = spawnSync('git', args, {
                      shell: false,
                      stdio: [0, 1, 2], // display output from git
                      cwd: path.resolve(fallbackDependenciesDir, '') // where we're cloning the repo to
                    })
                    if (cloneUrl.status !== 0) throw cloneUrl.stderr.toString()
                    const checkout = spawnSync('git', ['checkout', version], {
                      shell: false,
                      cwd: path.resolve(fallbackDependenciesDir + '/' + dependency, '')
                    })
                    if (checkout.status !== 0) throw checkout.stderr.toString()
                    logger.log(`Successfully checked out commit ${version}.`)
                  } else throw output.stderr.toString()
                }
              }
              // do npm ci in the new dir only if package-lock exists and the don't install deps flag is not set
              if (fs.existsSync(fallbackDependenciesDir + '/' + dependency + '/package-lock.json') && !skipDeps) {
                logger.log('Running npm ci on ' + fallbackDependenciesDir + '/' + dependency + '...')
                const args = ['ci']
                if (listType === 'fallbackDependencies') args.push('--omit=dev')
                if (process.env.FALLBACK_DEPENDENCIES_NPM_CI_ARGS || pkg[listType].npmCiArgs) { // add specified args to npm ci
                  const npmCiArgs = process.env.FALLBACK_DEPENDENCIES_NPM_CI_ARGS ? process.env.FALLBACK_DEPENDENCIES_NPM_CI_ARGS : pkg[listType].npmCiArgs
                  if (Array.isArray(npmCiArgs)) args.push(...npmCiArgs)
                  else args.push(...npmCiArgs.split(' '))
                }
                const output = spawnSync('npm', args, {
                  env: Object.assign(process.env, {
                    FALLBACK_DEPENDENCIES_INITIATED_COMMAND: true
                  }),
                  shell: true, // necessary to get npm in windows' PATH
                  stdio: [0, 1, 2], // display output from git
                  cwd: path.resolve(fallbackDependenciesDir + '/' + dependency, '')
                })
                if (output.status !== 0) {
                  logger.error(output)
                  logger.error(`Fatal error: unable to install dependencies for: ${dependency}`)
                }
              }
              break // if it successfully clones, skip trying the fallback
            } catch (e) {
              if (fallbacks.length === (parseInt(i) + 1)) {
                logger.error('Unable to resolve dependency ' + dependency + ' — all fallbacks failed to clone!\n')
                logger.error(e)
                failedDependencies.push(dependency)
                failedToClone++
              } else {
                logger.log('Trying fallback...')
              }
            }
          }
        }

        // remove stale directories from target directory
        if (process.env.FALLBACK_DEPENDENCIES_REMOVE_STALE_DIRECTORIES || pkg[listType].removeStaleDirectories) {
          const repoList = Object.keys(pkg[listType].repos)
          const files = fs.readdirSync(fallbackDependenciesDir, { withFileTypes: true })
          const directories = files.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name)
          const reposToRemove = directories.filter(value => !repoList.includes(value))
          if (reposToRemove.length > 0) {
            for (const repo of reposToRemove) fs.rmSync(path.resolve(fallbackDependenciesDir + '/' + repo, ''), { recursive: true, force: true })
            logger.log('Removed stale directories from ' + fallbackDependenciesDir)
          }
        }

        // throw error message if any fallbacks failed to clone
        if (failedToClone > 0) {
          logger.log('')
          logger.error(`${failedToClone} out of ${Object.keys(pkg[listType].repos).length} dependencies failed to clone, including:`)
          for (const dependency of failedDependencies) logger.error('  ' + dependency)
          process.exit(1)
        }
      }
    }
  })
}

executeFallbackList(['fallbackDevDependencies', 'fallbackDependencies'])
