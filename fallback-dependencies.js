const fs = require('fs')
const path = require('path')
const Logger = require('roosevelt-logger')
const logger = new Logger()
const { spawnSync, spawn } = require('child_process')
const pacote = require('pacote')
const npa = require('npm-package-arg')
let pkgPath = process.argv[1] // full path of postinstall script being executed, presumably buried in node_modules in your app
pkgPath = pkgPath.split('node_modules')[0] // take only the part preceding node_modules
const pkg = require(pkgPath + 'package.json') // require the package.json in that folder

const registryTypes = new Set(['version', 'range', 'tag', 'alias', 'remote']) // npm spec types that resolve to a tarball rather than a git repo

// run a git command, returning its trimmed stdout and throwing its stderr if it fails
function git (args, cwd) {
  const result = spawnSync('git', args, {
    shell: false,
    cwd
  })
  if (result.status !== 0) throw result.stderr.toString()
  return result.stdout.toString().trim()
}

// sanity check that git actually works
function assertGitWorks () {
  return new Promise((resolve, reject) => {
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

    gitProcess.on('close', (code) => {
      clearTimeout(timeout)
      if (code !== 1) { // git's help messages exit with code 1
        if (error) logger.error(error)
        reject(new Error(`git process failed with code ${code}`))
      } else resolve()
    })
  })
}

// parse a spec, rejecting the formats that this module used to accept but no longer does
function parseSpec (spec) {
  if (spec.includes(' -b ')) throw new Error(`"${spec}" uses the "<url> -b <version>" syntax that was removed in fallback-dependencies 2.0.0. Use an npm package spec instead, e.g. "git+https://example.com/some/repo.git#<version>".`)
  const parsed = npa(spec)
  if (parsed.type === 'directory' || parsed.type === 'file') throw new Error(`"${spec}" was read as a local path rather than a git repo. To clone a git repo from the local filesystem, use a git+file:// url, e.g. "git+file:///absolute/path/to/repo.git".`)
  if (parsed.type !== 'git' && !registryTypes.has(parsed.type)) throw new Error(`"${spec}" is not a spec that fallback-dependencies knows how to fetch.`)
  return parsed
}

// determine whether a ref names a branch on the remote; only branches can be left checked out in a tracking state, tags and commit ids have to be detached
function refIsBranch (url, ref, range) {
  if (range) return false // a semver range resolves to a tag, which has to be detached
  if (!ref) return true // no ref means the remote's default branch, which is always a branch
  if (/^[0-9a-f]{40}$/i.test(ref)) return false // a full commit id can never be a branch name
  return git(['ls-remote', '--heads', url, ref]) !== ''
}

// name of the branch the remote points HEAD at
function defaultBranch (dir) {
  const remote = git(['remote'], dir).split('\n')[0].trim()
  return git(['rev-parse', '--abbrev-ref', `${remote}/HEAD`], dir).replace(remote + '/', '')
}

// fetch a git spec into targetDir, returning false if the existing clone was already up to date
function fetchGitDependency (spec, parsed, targetDir, parentDir, dependency, enableCheckout) {
  const resolved = npa(spec.resolved)
  const url = resolved.fetchSpec // git-usable url, whether or not the host is one npm has a shorthand for
  const commit = resolved.gitCommittish // the specific commit the spec resolved to
  const requestedRef = parsed.gitCommittish // branch, tag or commit id as the user wrote it, if any
  const requestedRange = parsed.gitRange // semver range as the user wrote it, if any
  let reClone = false

  if (fs.existsSync(targetDir)) {
    if (!fs.existsSync(targetDir + '/.git/config')) {
      logger.error('Cannot update ' + targetDir + ' because it does not appear to be a git repo!')
      return 'skip' // move on to next dep
    }
    if (!fs.readFileSync(targetDir + '/.git/config', 'utf8').includes(url)) { // scan .git/config to check if url supplied exists within it
      logger.log('Removing ' + targetDir + ' from ' + url + ' because a different git url was supplied. It will be re-cloned.')
      fs.rmSync(path.resolve(targetDir), { recursive: true, force: true })
      reClone = true
    } else if (!enableCheckout) {
      logger.log('Removing ' + targetDir + ' from ' + url + ' because the enableCheckout feature is disabled. It will be re-cloned.')
      fs.rmSync(path.resolve(targetDir), { recursive: true, force: true })
      reClone = true
    } else {
      if (git(['rev-parse', 'HEAD'], targetDir) === commit) { // already sitting on the commit the spec resolves to
        logger.log('Already up to date: ' + targetDir + ' from ' + url + ' is already up to date.')
        return false
      }
      git(['fetch', '--all', '--tags'], targetDir)
      if (refIsBranch(url, requestedRef, requestedRange)) { // stay on the branch so the working tree remains usable
        const branch = requestedRef || defaultBranch(targetDir)
        git(['checkout', branch], targetDir)
        git(['pull', git(['remote'], targetDir).split('\n')[0].trim(), branch], targetDir)
        logger.log(`Successfully updated branch ${branch}.`)
      } else { // a tag or commit id can only be checked out detached
        git(['checkout', '--detach', commit], targetDir)
        logger.log(`Successfully checked out ${requestedRef || commit}.`)
      }
      return true
    }
  }

  if (reClone || !fs.existsSync(targetDir)) {
    logger.log('Trying to clone ' + url + ' ' + dependency)
    const isBranch = refIsBranch(url, requestedRef, requestedRange)
    const args = ['clone']
    if (isBranch) {
      if (requestedRef) args.push('-b', requestedRef)
    } else args.push('--no-checkout') // avoid checking out a tree we are about to replace
    args.push(url, dependency)
    const output = spawnSync('git', args, {
      shell: false,
      stdio: [0, 1, 2], // display output from git
      cwd: path.resolve(parentDir) // where we're cloning the repo to
    })
    if (output.status !== 0) throw new Error(`failed to clone ${url}`)
    if (!isBranch) {
      git(['checkout', '--detach', commit], targetDir)
      logger.log(`Successfully cloned ${url} and checked out ${requestedRef || commit}.`)
    }
  }
  return true
}

// fetch a registry spec into targetDir, returning false if what is already there is up to date
async function fetchRegistryDependency (spec, targetDir) {
  const manifest = await pacote.manifest(spec.raw)
  if (fs.existsSync(targetDir)) {
    let installed
    try {
      installed = JSON.parse(fs.readFileSync(targetDir + '/package.json', 'utf8'))
    } catch {
      installed = null
    }
    if (installed && installed.version === manifest.version) {
      logger.log('Already up to date: ' + targetDir + ' is already at version ' + manifest.version + '.')
      return false
    }
    fs.rmSync(path.resolve(targetDir), { recursive: true, force: true })
  }
  logger.log('Extracting ' + manifest.name + '@' + manifest.version + ' to ' + targetDir)
  await pacote.extract(spec.raw, targetDir)
  return true
}

// run npm ci inside a freshly fetched dependency, if it ships a lockfile
function installDependencies (listType, targetDir, dependency) {
  if (!fs.existsSync(targetDir + '/package-lock.json')) return
  logger.log('Running npm ci on ' + targetDir + '...')
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
    stdio: [0, 1, 2], // display output from npm
    cwd: path.resolve(targetDir)
  })
  if (output.status !== 0) {
    logger.error(output)
    logger.error(`Fatal error: unable to install dependencies for: ${dependency}`)
  }
}

async function processList (listType) {
  let reposFile = {}
  if (!pkg[listType] || (!pkg[listType].repos && !pkg[listType].reposFile)) return // do nothing if these entries in package.json aren't there
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
      const specs = pkg[listType].repos[key]
      for (let i = 0; i < specs.length; i++) {
        if (specs[i].includes(preferredWildcard)) {
          const spec = specs[i]
          specs.splice(i, 1)
          specs.unshift(spec)
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
    if (e.code !== 'EEXIST') { // do nothing if it exists already
      logger.error(e) // log the error if it erred for some other reason
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
    const targetDir = fallbackDependenciesDir + '/' + dependency
    for (const [i, fallback] of fallbacks.entries()) {
      let spec = fallback
      const rerunNpmCi = process.env.FALLBACK_DEPENDENCIES_RERUN_NPM_CI || pkg[listType].rerunNpmCi
      const enableCheckout = process.env.FALLBACK_DEPENDENCIES_ENABLE_CHECKOUT || pkg[listType].enableCheckout
      let skipDeps = false
      if (spec.slice(-11) === ' -skip-deps') {
        spec = spec.slice(0, -11)
        skipDeps = true
      }
      try {
        const parsed = parseSpec(spec)
        let updated
        if (parsed.type === 'git') {
          const resolved = await pacote.resolve(spec) // ask pacote to turn the spec into a url and an exact commit
          updated = fetchGitDependency({ raw: spec, resolved }, parsed, targetDir, fallbackDependenciesDir, dependency, enableCheckout)
          if (updated === 'skip') break // move on to next dep
        } else updated = await fetchRegistryDependency({ raw: spec }, targetDir)
        if (!updated && !rerunNpmCi) break // stop checking fallbacks
        if (!skipDeps) installDependencies(listType, targetDir, dependency)
        break // if it successfully fetches, skip trying the fallback
      } catch (e) {
        if (fallbacks.length === i + 1) {
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
    const repoList = Object.keys(pkg[listType].repos).map(dep => dep.split(':')[0])
    const files = fs.readdirSync(fallbackDependenciesDir, { withFileTypes: true })
    const directories = files.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name)
    const reposToRemove = directories.filter(value => !repoList.includes(value))
    if (reposToRemove.length > 0) {
      for (const repo of reposToRemove) fs.rmSync(path.resolve(fallbackDependenciesDir + '/' + repo), { recursive: true, force: true })
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

async function executeFallbackList (listTypes) {
  await assertGitWorks()
  for (const listType of listTypes) await processList(listType)
}

executeFallbackList(['fallbackDevDependencies', 'fallbackDependencies']).catch(e => {
  logger.error(e)
  process.exit(1)
})
