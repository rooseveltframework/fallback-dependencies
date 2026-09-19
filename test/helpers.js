// shared fixture builder for the test suite
//
// every test gets its own temp directory containing bare git repos to fetch from and a consuming app to fetch them into, so nothing is shared between tests and nothing leaks into the repo

const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { pathToFileURL } = require('node:url')
const { spawnSync } = require('node:child_process')

const moduleRoot = path.resolve(__dirname, '..')
const isWindows = os.platform() === 'win32'
const ansiPattern = new RegExp(String.fromCharCode(27) + '\\[\\d+m', 'g')

// run a git command, throwing a useful message if it fails
function git (args, cwd) {
  const result = spawnSync('git', args, { cwd, shell: false, encoding: 'utf8' })
  if (result.status !== 0) throw new Error(`git ${args.join(' ')} failed in ${cwd}:\n${result.stderr}`)
  return result.stdout.trim()
}

// strip the color codes roosevelt-logger writes so assertions can match plain text
function stripAnsi (text) {
  return text.replace(ansiPattern, '')
}

// create an isolated scratch directory; tests remove it in their own cleanup
function createSandbox () {
  // realpath because macOS hands out a symlinked temp dir, which would break url comparisons
  return fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'fallback-deps-'))
}

function removeSandbox (sandbox) {
  fs.rmSync(sandbox, { recursive: true, force: true })
}

// build a bare git repo to serve as a fetchable remote
//
// commits is a list of { files, tag, branch } applied in order, where files maps a filename to either a string or an object that gets serialized as JSON
function createRepo (sandbox, name, commits) {
  const work = path.join(sandbox, 'work', name)
  const bare = path.join(sandbox, 'remotes', `${name}.git`)
  fs.mkdirSync(work, { recursive: true })
  git(['init', '-q', '-b', 'main', '.'], work)
  git(['config', 'user.email', 'test@example.com'], work)
  git(['config', 'user.name', 'fallback-dependencies tests'], work)
  git(['config', 'commit.gpgsign', 'false'], work)

  const tags = {}
  const commitIds = {}
  for (const [index, commit] of commits.entries()) {
    if (commit.branch) git(['checkout', '-q', '-b', commit.branch], work)
    for (const [file, contents] of Object.entries(commit.files || {})) {
      const destination = path.join(work, file)
      fs.mkdirSync(path.dirname(destination), { recursive: true })
      fs.writeFileSync(destination, typeof contents === 'string' ? contents : JSON.stringify(contents, null, 2))
    }
    git(['add', '-A'], work)
    git(['commit', '-q', '-m', commit.message || `commit ${index}`], work)
    commitIds[commit.name || `commit${index}`] = git(['rev-parse', 'HEAD'], work)
    if (commit.tag) {
      git(['tag', commit.tag], work)
      tags[commit.tag] = git(['rev-parse', 'HEAD'], work)
    }
  }
  git(['checkout', '-q', 'main'], work)

  fs.mkdirSync(path.dirname(bare), { recursive: true })
  git(['clone', '-q', '--bare', work, bare], sandbox)
  return { name, work, bare, url: gitUrl(bare), tags, commitIds }
}

// a git+file:// url for a path, which is how a local repo is named as an npm package spec
function gitUrl (repoPath) {
  return 'git+' + pathToFileURL(repoPath).href
}

// push whatever is currently in a repo's working clone up to its bare remote
function pushRepo (repo, branch = 'main') {
  git(['push', '-q', repo.bare, branch], repo.work)
  git(['push', '-q', '--tags', repo.bare], repo.work)
}

// add a commit to a repo's working clone and publish it to the bare remote
function addCommit (repo, files, { branch = 'main', tag, message = 'another commit' } = {}) {
  git(['checkout', '-q', branch], repo.work)
  for (const [file, contents] of Object.entries(files)) {
    fs.writeFileSync(path.join(repo.work, file), typeof contents === 'string' ? contents : JSON.stringify(contents, null, 2))
  }
  git(['add', '-A'], repo.work)
  git(['commit', '-q', '-m', message], repo.work)
  if (tag) git(['tag', tag], repo.work)
  pushRepo(repo, branch)
  return git(['rev-parse', 'HEAD'], repo.work)
}

// build the app that declares fallback dependencies, with this module linked in the way npm links a file: dependency
function createApp (sandbox, config, { listType = 'fallbackDependencies', reposFile, name = 'app' } = {}) {
  const appDir = path.join(sandbox, name)
  fs.mkdirSync(path.join(appDir, 'node_modules'), { recursive: true })

  const pkg = {
    name,
    version: '1.0.0',
    scripts: { postinstall: 'node node_modules/fallback-dependencies/fallback-dependencies.js' }
  }
  pkg[listType] = config
  fs.writeFileSync(path.join(appDir, 'package.json'), JSON.stringify(pkg, null, 2))
  if (reposFile) fs.writeFileSync(path.join(appDir, reposFile.name), JSON.stringify(reposFile.contents, null, 2))

  // a junction rather than a symlink so this works on Windows without elevated privileges
  fs.symlinkSync(moduleRoot, path.join(appDir, 'node_modules', 'fallback-dependencies'), 'junction')
  return appDir
}

// run the module the same way the postinstall script would
function run (appDir, env = {}) {
  const result = spawnSync(process.execPath, [path.join('node_modules', 'fallback-dependencies', 'fallback-dependencies.js')], {
    cwd: appDir,
    shell: false,
    encoding: 'utf8',
    env: { ...process.env, ...env }
  })
  return {
    status: result.status,
    stdout: stripAnsi(result.stdout || ''),
    stderr: stripAnsi(result.stderr || ''),
    output: stripAnsi((result.stdout || '') + (result.stderr || ''))
  }
}

// put a stand-in `git` at the front of PATH so the module's git sanity check can be driven without touching the real git or this process's own environment
//
// there is no Windows equivalent: a stand-in there would have to be a .cmd, and Node refuses to spawn one without shell: true, which the module deliberately does not use. Tests that need this are skipped on Windows.
function fakeGitPath (sandbox, script) {
  const binDir = path.join(sandbox, 'fakebin')
  fs.mkdirSync(binDir, { recursive: true })
  const fakeGit = path.join(binDir, 'git')
  fs.writeFileSync(fakeGit, script)
  fs.chmodSync(fakeGit, 0o755)
  return binDir + path.delimiter + process.env.PATH
}

// read the version recorded in a fetched dependency's package.json
function installedVersion (dir) {
  return JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8')).version
}

// the branch a clone is sitting on, or null when its HEAD is detached
function currentBranch (dir) {
  const branch = git(['branch', '--show-current'], dir)
  return branch === '' ? null : branch
}

module.exports = {
  addCommit,
  createApp,
  createRepo,
  createSandbox,
  currentBranch,
  fakeGitPath,
  git,
  gitUrl,
  installedVersion,
  isWindows,
  moduleRoot,
  pushRepo,
  removeSandbox,
  run,
  stripAnsi
}
