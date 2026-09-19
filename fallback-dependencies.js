const fs = require('fs')
const os = require('os')
const path = require('path')
const Logger = require('roosevelt-logger')
const logger = new Logger()
const { spawnSync, spawn } = require('child_process')
const pacote = require('pacote')
const npa = require('npm-package-arg')
let pkgPath = process.argv[1] // full path of postinstall script being executed, presumably buried in node_modules in your app
pkgPath = pkgPath.split('node_modules')[0] // take only the part preceding node_modules
const pkg = require(pkgPath + 'package.json') // require the package.json in that folder

// read one .npmrc, expanding the ${VAR} references npm supports in its values
function readNpmrc (file) {
  const config = {}
  let contents
  try {
    contents = fs.readFileSync(file, 'utf8')
  } catch {
    return config // a missing .npmrc simply contributes nothing
  }
  for (const line of contents.split('\n')) {
    const trimmed = line.trim()
    if (trimmed === '' || trimmed.startsWith(';') || trimmed.startsWith('#') || trimmed.startsWith('[')) continue
    const separator = trimmed.indexOf('=')
    if (separator === -1) continue
    const key = trimmed.slice(0, separator).trim()
    let value = trimmed.slice(separator + 1).trim()
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1)
    config[key] = value.replace(/\$\{([^}]+)\}/g, (match, name) => process.env[name] ?? match)
  }
  return config
}

// npm's own configuration, so that registry, scoped registries, auth tokens, proxies and the shared cache all behave here exactly as they do for npm itself
//
// the .npmrc files are read directly because npm exports only some of its resolved config to lifecycle scripts, deliberately withholding auth tokens; whatever it does export wins, since that is what npm resolved for this run
function npmConfig () {
  const config = {}
  // the project .npmrc is the one belonging to the app being installed into, which is pkgPath; npm_config_local_prefix would point at whatever project invoked npm, which is not the same thing when this runs as a nested install
  const files = [
    process.env.npm_config_globalconfig,
    process.env.npm_config_userconfig || path.join(os.homedir(), '.npmrc'),
    path.join(pkgPath, '.npmrc')
  ]
  for (const file of files) {
    if (file) Object.assign(config, readNpmrc(file))
  }
  for (const [key, value] of Object.entries(process.env)) {
    if (!key.startsWith('npm_config_') || value === '') continue
    config[key.slice('npm_config_'.length).replace(/_/g, '-')] = value
  }
  // a few options reach npm-registry-fetch under a different name than .npmrc spells them
  const aliases = { 'strict-ssl': 'strictSSL', 'https-proxy': 'httpsProxy', noproxy: 'noProxy', 'fetch-retries': 'fetchRetries', maxsockets: 'maxSockets' }
  for (const [from, to] of Object.entries(aliases)) {
    if (config[from] !== undefined) config[to] = config[from]
  }
  if (config.strictSSL !== undefined) config.strictSSL = config.strictSSL !== 'false' && config.strictSSL !== false
  return config
}

const npmOpts = npmConfig()

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

// trimmed stdout of a git command, or null when it fails, for lookups where failure is an answer rather than an error
function gitOrNull (args, cwd) {
  const result = spawnSync('git', args, { shell: false, cwd })
  return result.status === 0 ? result.stdout.toString().trim() : null
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

// the branch the spec expects the clone to be sitting on, or null when the spec pins a commit that has to be checked out detached
//
// answered from the clone's own remote-tracking refs so that a run with nothing to do costs no network; a branch created upstream since the last fetch reads as a tag here, which only leaves the clone detached on the right commit until something else changes
function expectedBranch (targetDir, remote, requestedRef, requestedRange) {
  if (requestedRange) return null // a semver range resolves to a tag
  if (!requestedRef) return defaultBranch(targetDir) // no committish means the remote's default branch
  if (/^[0-9a-f]{40}$/i.test(requestedRef)) return null // a full commit id can never be a branch name
  return gitOrNull(['show-ref', '--verify', `refs/remotes/${remote}/${requestedRef}`], targetDir) === null ? null : requestedRef
}

// bring an existing clone to the commit the spec resolves to, returning false when nothing needed doing or 'reclone' when the clone cannot get there
//
// throws rather than recloning when the clone holds commits that starting over would destroy, because these directories are live working copies people commit in
function updateGitClone (targetDir, url, commit, requestedRef, requestedRange) {
  const remote = git(['remote'], targetDir).split('\n')[0].trim()
  const head = git(['rev-parse', 'HEAD'], targetDir)
  const onBranch = gitOrNull(['branch', '--show-current'], targetDir) || null // null when the clone is detached
  const wantBranch = expectedBranch(targetDir, remote, requestedRef, requestedRange)

  // being on the right commit is not enough: a clone left detached by an earlier tag or commit spec still has to be moved onto the branch once the spec asks for one
  if (head === commit && onBranch === wantBranch) {
    logger.log('Already up to date: ' + targetDir + ' from ' + url + ' is already up to date.')
    return false
  }

  // what this clone last saw the remote branch pointing at, read before fetching so that local commits can later be told apart from a remote that rewrote its history
  const lastSynced = wantBranch === null ? null : gitOrNull(['rev-parse', `${remote}/${wantBranch}`], targetDir)

  git(['fetch', '--all', '--tags'], targetDir)
  if (gitOrNull(['cat-file', '-e', `${commit}^{commit}`], targetDir) === null) { // the commit the spec resolves to cannot be obtained at all
    logger.log('Cannot reach ' + commit + ' from ' + url + '.')
    return 'reclone'
  }

  const branch = expectedBranch(targetDir, remote, requestedRef, requestedRange) // recomputed now that the remote-tracking refs are current
  if (branch === null) { // a tag, commit id or semver range can only be checked out detached
    git(['checkout', '--detach', commit], targetDir)
    logger.log(`Successfully checked out ${requestedRef || commit}.`)
    return true
  }

  git(['checkout', branch], targetDir) // a branch stays checked out so the working tree remains usable
  const branchHead = git(['rev-parse', 'HEAD'], targetDir)
  if (branchHead === commit) {
    logger.log(`Successfully checked out ${branch}.`)
    return true
  }
  if (gitOrNull(['merge-base', '--is-ancestor', branchHead, commit], targetDir) !== null) { // the branch simply moved ahead, so fast forward onto what was just fetched
    git(['merge', '--ff-only', commit], targetDir)
    logger.log(`Successfully updated branch ${branch}.`)
    return true
  }
  if (gitOrNull(['merge-base', '--is-ancestor', commit, branchHead], targetDir) !== null) { // local commits sit on top of the remote, so there is nothing to pull
    logger.log('Leaving ' + targetDir + ' alone because it has local commits that are ahead of ' + branch + '.')
    return false
  }
  if (branchHead === lastSynced) { // the clone never moved, so the history it holds came from the remote and there is no local work to lose
    logger.log(targetDir + ' no longer shares history with ' + branch + ' on ' + url + '.')
    return 'reclone'
  }
  throw new Error(`${targetDir} has diverged from ${branch} on ${url}. Reconcile or remove it by hand; refusing to re-clone over local commits.`)
}

// fetch a git spec into targetDir, returning false if the existing clone was already up to date
function fetchGitDependency (spec, parsed, targetDir, parentDir, dependency) {
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
    const remote = gitOrNull(['remote'], targetDir)
    if (remote === null || remote === '') {
      logger.log('Removing ' + targetDir + ' because it has no git remote. It will be re-cloned.')
      fs.rmSync(path.resolve(targetDir), { recursive: true, force: true })
      reClone = true
    } else {
      // a different url is often just another mirror of the same repo, which fallback lists are full of, so repoint the remote and let the update decide whether the history actually matches rather than rebuilding on the url alone
      if (!fs.readFileSync(targetDir + '/.git/config', 'utf8').includes(url)) {
        logger.log('Pointing ' + targetDir + ' at ' + url + ' because a different git url was supplied.')
        git(['remote', 'set-url', remote.split('\n')[0].trim(), url], targetDir)
      }
      const updated = updateGitClone(targetDir, url, commit, requestedRef, requestedRange)
      if (updated !== 'reclone') return updated
      logger.log('Removing ' + targetDir + '. It will be re-cloned.')
      fs.rmSync(path.resolve(targetDir), { recursive: true, force: true })
      reClone = true
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
  const manifest = await pacote.manifest(spec.raw, npmOpts)
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
  await pacote.extract(spec.raw, targetDir, npmOpts)
  return true
}

// install a fetched dependency's own dependencies, and build it the way npm builds a git dependency
//
// npm runs a git dependency's prepare script, installing its devDependencies first because that is where the build toolchain lives; npm ci and npm install both run prepare themselves, so the work here is deciding which command to run and whether devDependencies are needed
function installDependencies (listType, targetDir, dependency, isGit) {
  const hasLockfile = fs.existsSync(targetDir + '/package-lock.json')
  let manifest
  try {
    manifest = JSON.parse(fs.readFileSync(targetDir + '/package.json', 'utf8'))
  } catch {
    manifest = {}
  }
  const skipPrepare = process.env.FALLBACK_DEPENDENCIES_SKIP_PREPARE || pkg[listType].skipPrepare
  const build = isGit && !skipPrepare && Boolean(manifest.scripts && manifest.scripts.prepare)
  if (!hasLockfile && !build) return // nothing to install and nothing to build

  const args = [hasLockfile ? 'ci' : 'install']
  if (listType === 'fallbackDependencies' && !build) args.push('--omit=dev') // devDependencies are kept when a build needs them
  if (process.env.FALLBACK_DEPENDENCIES_NPM_CI_ARGS || pkg[listType].npmCiArgs) { // add specified args to npm ci
    const npmCiArgs = process.env.FALLBACK_DEPENDENCIES_NPM_CI_ARGS ? process.env.FALLBACK_DEPENDENCIES_NPM_CI_ARGS : pkg[listType].npmCiArgs
    if (Array.isArray(npmCiArgs)) args.push(...npmCiArgs)
    else args.push(...npmCiArgs.split(' '))
  }
  logger.log('Running npm ' + args[0] + ' on ' + targetDir + (build ? ' and building it with its prepare script...' : '...'))
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
      let skipDeps = false
      if (spec.slice(-11) === ' -skip-deps') {
        spec = spec.slice(0, -11)
        skipDeps = true
      }
      try {
        const parsed = parseSpec(spec)
        let updated
        if (parsed.type === 'git') {
          const resolved = await pacote.resolve(spec, npmOpts) // ask pacote to turn the spec into a url and an exact commit
          updated = fetchGitDependency({ raw: spec, resolved }, parsed, targetDir, fallbackDependenciesDir, dependency)
          if (updated === 'skip') break // move on to next dep
        } else updated = await fetchRegistryDependency({ raw: spec }, targetDir)
        if (!updated && !rerunNpmCi) break // stop checking fallbacks
        if (!skipDeps) installDependencies(listType, targetDir, dependency, parsed.type === 'git')
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
