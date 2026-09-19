const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const {
  addCommit,
  createApp,
  createBranch,
  createRepo,
  createSandbox,
  currentBranch,
  fakeGitPath,
  git,
  gitUrl,
  installedVersion,
  isWindows,
  mirrorRepo,
  removeSandbox,
  rewriteBranch,
  run
} = require('./helpers')

// standing in for git needs an executable Node will spawn without a shell, which rules out the .cmd a Windows stand-in would have to be; the logic these cover is not platform specific
const skipShim = isWindows ? 'needs a git stand-in that Node can spawn without a shell' : false

// give every test its own sandbox and tear it down afterwards, whether it passed or not
function sandboxed (t) {
  const sandbox = createSandbox()
  t.after(() => removeSandbox(sandbox))
  return sandbox
}

// a repo with three versions: v1.0.0 tagged, v1.1.0 tagged, and an untagged v1.2.0 on main
function versionedRepo (sandbox, name = 'dep') {
  return createRepo(sandbox, name, [
    { files: { 'package.json': { name, version: '1.0.0' } }, tag: 'v1.0.0', name: 'v1' },
    { files: { 'package.json': { name, version: '1.1.0' } }, tag: 'v1.1.0', name: 'v11' },
    { files: { 'package.json': { name, version: '1.2.0' } }, name: 'v12' }
  ])
}

test('fetching git dependencies', async t => {
  await t.test('clones a dependency into the configured directory', t => {
    const sandbox = sandboxed(t)
    const repo = versionedRepo(sandbox)
    const app = createApp(sandbox, { dir: 'lib', repos: { dep: repo.url } })

    const result = run(app)

    assert.equal(result.status, 0, result.output)
    assert.ok(fs.existsSync(path.join(app, 'lib/dep/.git')), 'the dependency was not cloned')
    assert.equal(installedVersion(path.join(app, 'lib/dep')), '1.2.0')
  })

  await t.test('defaults to a fallback_dependencies directory', t => {
    const sandbox = sandboxed(t)
    const repo = versionedRepo(sandbox)
    const app = createApp(sandbox, { repos: { dep: repo.url } })

    run(app)

    assert.ok(fs.existsSync(path.join(app, 'fallback_dependencies/dep')), 'the default directory was not used')
  })

  await t.test('accepts a single spec as a string rather than an array', t => {
    const sandbox = sandboxed(t)
    const repo = versionedRepo(sandbox)
    const app = createApp(sandbox, { dir: 'lib', repos: { dep: repo.url } })

    assert.equal(run(app).status, 0)
    assert.ok(fs.existsSync(path.join(app, 'lib/dep/.git')))
  })

  await t.test('stays on the branch when the spec names one', t => {
    const sandbox = sandboxed(t)
    const repo = createRepo(sandbox, 'dep', [
      { files: { 'package.json': { name: 'dep', version: '1.0.0' } } },
      { files: { 'package.json': { name: 'dep', version: '2.0.0' } }, branch: 'next' }
    ])
    const app = createApp(sandbox, { dir: 'lib', repos: { dep: `${repo.url}#next` } })

    run(app)

    const dep = path.join(app, 'lib/dep')
    assert.equal(currentBranch(dep), 'next', 'the clone should be left on the requested branch')
    assert.equal(installedVersion(dep), '2.0.0')
  })

  await t.test('stays on the default branch when the spec names no committish', t => {
    const sandbox = sandboxed(t)
    const repo = versionedRepo(sandbox)
    const app = createApp(sandbox, { dir: 'lib', repos: { dep: repo.url } })

    run(app)

    assert.equal(currentBranch(path.join(app, 'lib/dep')), 'main')
  })

  await t.test('detaches at the commit a tag points to', t => {
    const sandbox = sandboxed(t)
    const repo = versionedRepo(sandbox)
    const app = createApp(sandbox, { dir: 'lib', repos: { dep: `${repo.url}#v1.0.0` } })

    run(app)

    const dep = path.join(app, 'lib/dep')
    assert.equal(currentBranch(dep), null, 'a tag should be checked out detached')
    assert.equal(installedVersion(dep), '1.0.0')
    assert.equal(git(['rev-parse', 'HEAD'], dep), repo.tags['v1.0.0'])
  })

  await t.test('detaches at a specific commit id', t => {
    const sandbox = sandboxed(t)
    const repo = versionedRepo(sandbox)
    const app = createApp(sandbox, { dir: 'lib', repos: { dep: `${repo.url}#${repo.commitIds.v11}` } })

    run(app)

    const dep = path.join(app, 'lib/dep')
    assert.equal(currentBranch(dep), null, 'a commit id should be checked out detached')
    assert.equal(git(['rev-parse', 'HEAD'], dep), repo.commitIds.v11)
    assert.equal(installedVersion(dep), '1.1.0')
  })

  await t.test('resolves a semver range against the repo tags', t => {
    const sandbox = sandboxed(t)
    const repo = versionedRepo(sandbox)
    const app = createApp(sandbox, { dir: 'lib', repos: { dep: `${repo.url}#semver:^1.0.0` } })

    const result = run(app)

    assert.equal(result.status, 0, result.output)
    // ^1.0.0 matches the highest tagged version, not the untagged commit on main
    assert.equal(installedVersion(path.join(app, 'lib/dep')), '1.1.0')
  })
})

test('updating dependencies that are already present', async t => {
  await t.test('reports that an unchanged dependency is already up to date', t => {
    const sandbox = sandboxed(t)
    const repo = versionedRepo(sandbox)
    const app = createApp(sandbox, { dir: 'lib', repos: { dep: repo.url } })

    run(app)
    const result = run(app)

    assert.match(result.output, /Already up to date/)
  })

  await t.test('pulls new commits and stays on the branch', t => {
    const sandbox = sandboxed(t)
    const repo = versionedRepo(sandbox)
    const app = createApp(sandbox, { dir: 'lib', repos: { dep: repo.url } })
    run(app)

    addCommit(repo, { 'package.json': { name: 'dep', version: '1.3.0' } })
    const result = run(app)

    const dep = path.join(app, 'lib/dep')
    assert.equal(result.status, 0, result.output)
    assert.equal(installedVersion(dep), '1.3.0', 'new commits should have been pulled')
    assert.equal(currentBranch(dep), 'main', 'pulling should not detach the clone')
  })

  await t.test('switches from a tag to a branch without recloning', t => {
    const sandbox = sandboxed(t)
    const repo = versionedRepo(sandbox)
    const app = createApp(sandbox, { dir: 'lib', repos: { dep: `${repo.url}#v1.0.0` } })
    run(app)
    const dep = path.join(app, 'lib/dep')
    fs.writeFileSync(path.join(dep, 'marker.txt'), 'still the same clone')

    const pkg = JSON.parse(fs.readFileSync(path.join(app, 'package.json'), 'utf8'))
    pkg.fallbackDependencies.repos.dep = repo.url
    fs.writeFileSync(path.join(app, 'package.json'), JSON.stringify(pkg, null, 2))
    const result = run(app)

    assert.equal(result.status, 0, result.output)
    assert.equal(currentBranch(dep), 'main')
    assert.equal(installedVersion(dep), '1.2.0')
    assert.ok(fs.existsSync(path.join(dep, 'marker.txt')), 'the clone should have been reused, not recloned')
  })

  await t.test('detaches onto a tag without recloning', t => {
    const sandbox = sandboxed(t)
    const repo = versionedRepo(sandbox)
    const app = createApp(sandbox, { dir: 'lib', repos: { dep: repo.url } })
    run(app)
    const dep = path.join(app, 'lib/dep')
    fs.writeFileSync(path.join(dep, 'marker.txt'), 'still the same clone')

    const pkg = JSON.parse(fs.readFileSync(path.join(app, 'package.json'), 'utf8'))
    pkg.fallbackDependencies.repos.dep = `${repo.url}#v1.0.0`
    fs.writeFileSync(path.join(app, 'package.json'), JSON.stringify(pkg, null, 2))
    const result = run(app)

    assert.equal(result.status, 0, result.output)
    assert.equal(currentBranch(dep), null, 'switching to a tag should detach')
    assert.equal(installedVersion(dep), '1.0.0')
    assert.ok(fs.existsSync(path.join(dep, 'marker.txt')), 'the clone should have been reused, not recloned')
  })

  // running the script twice with nothing changed upstream must not touch the clone
  for (const [label, spec] of [['no committish', ''], ['a branch', '#main'], ['a tag', '#v1.0.0'], ['a semver range', '#semver:^1.0.0']]) {
    await t.test(`leaves an up to date clone alone when the spec names ${label}`, t => {
      const sandbox = sandboxed(t)
      const repo = versionedRepo(sandbox)
      const app = createApp(sandbox, { dir: 'lib', repos: { dep: repo.url + spec } })
      assert.equal(run(app).status, 0)
      const dep = path.join(app, 'lib/dep')
      const clonedAt = git(['rev-parse', 'HEAD'], dep)
      fs.writeFileSync(path.join(dep, 'marker.txt'), 'must survive a second run')

      const result = run(app)

      assert.equal(result.status, 0, result.output)
      assert.match(result.output, /Already up to date/)
      assert.doesNotMatch(result.output, /Trying to clone/, 'an unchanged clone must not be re-cloned')
      assert.ok(fs.existsSync(path.join(dep, 'marker.txt')), 'the clone was destroyed and re-cloned')
      assert.equal(git(['rev-parse', 'HEAD'], dep), clonedAt)
    })
  }

  await t.test('leaves an up to date clone alone on every subsequent run', t => {
    const sandbox = sandboxed(t)
    const repo = versionedRepo(sandbox)
    const app = createApp(sandbox, { dir: 'lib', repos: { dep: repo.url } })
    run(app)
    fs.writeFileSync(path.join(app, 'lib/dep/marker.txt'), 'must survive every run')

    for (let i = 0; i < 3; i++) {
      const result = run(app)
      assert.doesNotMatch(result.output, /Trying to clone/, `run ${i + 2} re-cloned`)
    }

    assert.ok(fs.existsSync(path.join(app, 'lib/dep/marker.txt')))
  })

  await t.test('fast forwards a moved branch instead of recloning', t => {
    const sandbox = sandboxed(t)
    const repo = versionedRepo(sandbox)
    const app = createApp(sandbox, { dir: 'lib', repos: { dep: repo.url } })
    run(app)
    const dep = path.join(app, 'lib/dep')
    fs.writeFileSync(path.join(dep, 'marker.txt'), 'must survive an update')

    addCommit(repo, { 'package.json': { name: 'dep', version: '1.4.0' } }) // move the branch so the resolved commit no longer matches
    const result = run(app)

    assert.equal(result.status, 0, result.output)
    assert.doesNotMatch(result.output, /Trying to clone/, 'a moved branch should fast forward, not reclone')
    assert.equal(installedVersion(dep), '1.4.0')
    assert.equal(currentBranch(dep), 'main')
    assert.ok(fs.existsSync(path.join(dep, 'marker.txt')), 'the clone should have been reused')
  })

  await t.test('reclones a clone whose git remote has been removed', t => {
    const sandbox = sandboxed(t)
    const repo = versionedRepo(sandbox)
    const app = createApp(sandbox, { dir: 'lib', repos: { dep: `${repo.url}#main` } })
    run(app)
    const dep = path.join(app, 'lib/dep')
    git(['remote', 'remove', 'origin'], dep)
    fs.writeFileSync(path.join(dep, 'marker.txt'), 'should not survive')

    const result = run(app)

    assert.equal(result.status, 0, result.output)
    assert.match(result.output, /has no git remote/)
    assert.ok(!fs.existsSync(path.join(dep, 'marker.txt')), 'a clone with no remote should be replaced')
  })

  await t.test('reports a commit id that exists nowhere rather than claiming success', t => {
    const sandbox = sandboxed(t)
    const repo = versionedRepo(sandbox)
    const app = createApp(sandbox, { dir: 'lib', repos: { dep: `${repo.url}#main` } })
    run(app)

    const pkg = JSON.parse(fs.readFileSync(path.join(app, 'package.json'), 'utf8'))
    pkg.fallbackDependencies.repos.dep = `${repo.url}#0000000000000000000000000000000000000001`
    fs.writeFileSync(path.join(app, 'package.json'), JSON.stringify(pkg, null, 2))
    const result = run(app)

    assert.equal(result.status, 1)
    assert.match(result.output, /Cannot reach 0000000000000000000000000000000000000001/)
    assert.match(result.output, /failed to clone/)
  })

  await t.test('refuses to reclone over a clone that has diverged', t => {
    const sandbox = sandboxed(t)
    const repo = versionedRepo(sandbox)
    const app = createApp(sandbox, { dir: 'lib', repos: { dep: repo.url } })
    run(app)
    const dep = path.join(app, 'lib/dep')

    git(['config', 'user.email', 'dev@example.com'], dep) // a developer commits inside the fallback dependency
    git(['config', 'user.name', 'dev'], dep)
    fs.writeFileSync(path.join(dep, 'FEATURE.txt'), 'unpushed local work')
    git(['add', '-A'], dep)
    git(['commit', '-q', '-m', 'local work'], dep)
    addCommit(repo, { 'package.json': { name: 'dep', version: '1.4.0' } }) // and upstream moves too, so the two have diverged

    const result = run(app)

    assert.equal(result.status, 1, 'a diverged clone should be reported as a failure')
    assert.match(result.output, /has diverged/)
    assert.ok(fs.existsSync(path.join(dep, 'FEATURE.txt')), 'local work must never be destroyed')
  })

  await t.test('leaves a clone alone when it has local commits ahead of the remote', t => {
    const sandbox = sandboxed(t)
    const repo = versionedRepo(sandbox)
    const app = createApp(sandbox, { dir: 'lib', repos: { dep: repo.url } })
    run(app)
    const dep = path.join(app, 'lib/dep')

    git(['config', 'user.email', 'dev@example.com'], dep)
    git(['config', 'user.name', 'dev'], dep)
    fs.writeFileSync(path.join(dep, 'FEATURE.txt'), 'unpushed local work')
    git(['add', '-A'], dep)
    git(['commit', '-q', '-m', 'local work'], dep)

    const result = run(app)

    assert.equal(result.status, 0, result.output)
    assert.match(result.output, /local commits that are ahead of main/)
    assert.ok(fs.existsSync(path.join(dep, 'FEATURE.txt')), 'local work must be preserved')
  })

  await t.test('checks out the branch when the committish is dropped from the spec', t => {
    const sandbox = sandboxed(t)
    const repo = createRepo(sandbox, 'dep', [{ files: { 'package.json': { name: 'dep', version: '1.0.0' } }, tag: 'v1.0.0' }])
    const app = createApp(sandbox, { dir: 'lib', repos: { dep: `${repo.url}#v1.0.0` } })
    run(app)
    const dep = path.join(app, 'lib/dep')
    assert.equal(currentBranch(dep), null, 'a tag should start out detached')
    fs.writeFileSync(path.join(dep, 'marker.txt'), 'must survive')

    const pkg = JSON.parse(fs.readFileSync(path.join(app, 'package.json'), 'utf8'))
    pkg.fallbackDependencies.repos.dep = repo.url // the tag pointed at the branch tip, so the commit does not change
    fs.writeFileSync(path.join(app, 'package.json'), JSON.stringify(pkg, null, 2))
    const result = run(app)

    assert.equal(result.status, 0, result.output)
    assert.equal(currentBranch(dep), 'main', 'dropping the committish should move the clone onto the default branch')
    assert.doesNotMatch(result.output, /Trying to clone/, 'it should check out, not reclone')
    assert.ok(fs.existsSync(path.join(dep, 'marker.txt')), 'the clone should have been reused')
  })

  await t.test('is a no-op once the committish has been dropped and the branch checked out', t => {
    const sandbox = sandboxed(t)
    const repo = createRepo(sandbox, 'dep', [{ files: { 'package.json': { name: 'dep', version: '1.0.0' } }, tag: 'v1.0.0' }])
    const app = createApp(sandbox, { dir: 'lib', repos: { dep: repo.url } })
    run(app)

    const result = run(app)

    assert.match(result.output, /Already up to date/)
    assert.equal(currentBranch(path.join(app, 'lib/dep')), 'main')
  })

  await t.test('reuses the clone when the url changes to a mirror at the same commit', t => {
    const sandbox = sandboxed(t)
    const repo = versionedRepo(sandbox)
    const mirror = mirrorRepo(sandbox, repo, 'mirror')
    const app = createApp(sandbox, { dir: 'lib', repos: { dep: `${repo.url}#main` } })
    run(app)
    const dep = path.join(app, 'lib/dep')
    fs.writeFileSync(path.join(dep, 'marker.txt'), 'must survive a url change')

    const pkg = JSON.parse(fs.readFileSync(path.join(app, 'package.json'), 'utf8'))
    pkg.fallbackDependencies.repos.dep = `${mirror.url}#main`
    fs.writeFileSync(path.join(app, 'package.json'), JSON.stringify(pkg, null, 2))
    const result = run(app)

    assert.equal(result.status, 0, result.output)
    assert.doesNotMatch(result.output, /Trying to clone/, 'a mirror at the same commit should not trigger a reclone')
    assert.ok(fs.existsSync(path.join(dep, 'marker.txt')), 'the clone should have been reused')
    assert.match(git(['remote', 'get-url', 'origin'], dep), /mirror\.git$/, 'the remote should have been repointed')
  })

  await t.test('fast forwards when the url changes to a mirror that is ahead', t => {
    const sandbox = sandboxed(t)
    const repo = versionedRepo(sandbox)
    const app = createApp(sandbox, { dir: 'lib', repos: { dep: `${repo.url}#main` } })
    run(app)
    const dep = path.join(app, 'lib/dep')
    fs.writeFileSync(path.join(dep, 'marker.txt'), 'must survive a url change')

    addCommit(repo, { 'package.json': { name: 'dep', version: '1.5.0' } })
    const mirror = mirrorRepo(sandbox, repo, 'mirror') // mirrored after the new commit, so it is ahead of what was cloned
    const pkg = JSON.parse(fs.readFileSync(path.join(app, 'package.json'), 'utf8'))
    pkg.fallbackDependencies.repos.dep = `${mirror.url}#main`
    fs.writeFileSync(path.join(app, 'package.json'), JSON.stringify(pkg, null, 2))
    const result = run(app)

    assert.equal(result.status, 0, result.output)
    assert.doesNotMatch(result.output, /Trying to clone/, 'a mirror sharing history should fast forward, not reclone')
    assert.equal(installedVersion(dep), '1.5.0')
    assert.ok(fs.existsSync(path.join(dep, 'marker.txt')), 'the clone should have been reused')
  })

  await t.test('reclones when the url changes to a repo with unrelated history', t => {
    const sandbox = sandboxed(t)
    const repo = versionedRepo(sandbox)
    const unrelated = createRepo(sandbox, 'unrelated', [{ files: { 'package.json': { name: 'dep', version: '9.9.9' } } }])
    const app = createApp(sandbox, { dir: 'lib', repos: { dep: `${repo.url}#main` } })
    run(app)
    fs.writeFileSync(path.join(app, 'lib/dep/marker.txt'), 'should not survive')

    const pkg = JSON.parse(fs.readFileSync(path.join(app, 'package.json'), 'utf8'))
    pkg.fallbackDependencies.repos.dep = `${unrelated.url}#main`
    fs.writeFileSync(path.join(app, 'package.json'), JSON.stringify(pkg, null, 2))
    const result = run(app)

    assert.equal(result.status, 0, result.output)
    assert.match(result.output, /no longer shares history/)
    assert.ok(!fs.existsSync(path.join(app, 'lib/dep/marker.txt')), 'an unrelated repo must replace the clone')
    assert.equal(installedVersion(path.join(app, 'lib/dep')), '9.9.9')
  })

  await t.test('reclones when the resolved commit is no longer reachable upstream', t => {
    const sandbox = sandboxed(t)
    const repo = versionedRepo(sandbox)
    const app = createApp(sandbox, { dir: 'lib', repos: { dep: `${repo.url}#side` } })
    createBranch(repo, 'side', { 'package.json': { name: 'dep', version: '5.0.0' } })
    run(app)
    assert.equal(installedVersion(path.join(app, 'lib/dep')), '5.0.0')

    rewriteBranch(repo, 'side', { 'package.json': { name: 'dep', version: '6.0.0' } }) // force push rewrites the branch, orphaning what was cloned
    const result = run(app)

    assert.equal(result.status, 0, result.output)
    assert.equal(installedVersion(path.join(app, 'lib/dep')), '6.0.0')
  })

  await t.test('reclones when a different url is supplied', t => {
    const sandbox = sandboxed(t)
    const first = versionedRepo(sandbox, 'first')
    const second = createRepo(sandbox, 'second', [{ files: { 'package.json': { name: 'dep', version: '9.0.0' } } }])
    const app = createApp(sandbox, { dir: 'lib', repos: { dep: first.url } })
    run(app)

    const pkg = JSON.parse(fs.readFileSync(path.join(app, 'package.json'), 'utf8'))
    pkg.fallbackDependencies.repos.dep = second.url
    fs.writeFileSync(path.join(app, 'package.json'), JSON.stringify(pkg, null, 2))
    const result = run(app)

    assert.match(result.output, /a different git url was supplied/)
    assert.equal(installedVersion(path.join(app, 'lib/dep')), '9.0.0')
  })

  await t.test('refuses to touch a target directory that is not a git repo', t => {
    const sandbox = sandboxed(t)
    const repo = versionedRepo(sandbox)
    const app = createApp(sandbox, { dir: 'lib', repos: { dep: repo.url } })
    fs.mkdirSync(path.join(app, 'lib/dep'), { recursive: true })
    fs.writeFileSync(path.join(app, 'lib/dep/someones-work.txt'), 'do not delete me')

    const result = run(app)

    assert.match(result.output, /does not appear to be a git repo/)
    assert.ok(fs.existsSync(path.join(app, 'lib/dep/someones-work.txt')), 'a non-repo directory must be left alone')
  })
})

test('fallback behavior', async t => {
  await t.test('falls back to the next spec when the first cannot be reached', t => {
    const sandbox = sandboxed(t)
    const repo = versionedRepo(sandbox)
    const missing = gitUrl(path.join(sandbox, 'remotes', 'nope.git'))
    const app = createApp(sandbox, { dir: 'lib', repos: { dep: [missing, repo.url] } })

    const result = run(app)

    assert.equal(result.status, 0, result.output)
    assert.match(result.output, /Trying fallback/)
    assert.equal(installedVersion(path.join(app, 'lib/dep')), '1.2.0')
  })

  await t.test('exits non-zero and names the dependency when every fallback fails', t => {
    const sandbox = sandboxed(t)
    const app = createApp(sandbox, {
      dir: 'lib',
      repos: { dep: [gitUrl(path.join(sandbox, 'a.git')), gitUrl(path.join(sandbox, 'b.git'))] }
    })

    const result = run(app)

    assert.equal(result.status, 1)
    assert.match(result.output, /1 out of 1 dependencies failed to clone/)
    assert.match(result.output, /dep/)
  })

  await t.test('moves a preferred spec to the front of the list', t => {
    const sandbox = sandboxed(t)
    const preferred = createRepo(sandbox, 'preferred', [{ files: { 'package.json': { name: 'dep', version: '2.0.0' } } }])
    const other = createRepo(sandbox, 'other', [{ files: { 'package.json': { name: 'dep', version: '1.0.0' } } }])
    const app = createApp(sandbox, {
      dir: 'lib',
      preferredWildcard: 'preferred.git',
      repos: { dep: [other.url, preferred.url] }
    })

    run(app)

    assert.equal(installedVersion(path.join(app, 'lib/dep')), '2.0.0', 'the preferred spec should have been tried first')
  })

  await t.test('honors the preferred wildcard environment variable', t => {
    const sandbox = sandboxed(t)
    const preferred = createRepo(sandbox, 'preferred', [{ files: { 'package.json': { name: 'dep', version: '2.0.0' } } }])
    const other = createRepo(sandbox, 'other', [{ files: { 'package.json': { name: 'dep', version: '1.0.0' } } }])
    const app = createApp(sandbox, { dir: 'lib', repos: { dep: [other.url, preferred.url] } })

    run(app, { FALLBACK_DEPENDENCIES_PREFERRED_WILDCARD: 'preferred.git' })

    assert.equal(installedVersion(path.join(app, 'lib/dep')), '2.0.0')
  })
})

test('fetching registry dependencies', async t => {
  await t.test('extracts an exact version from the registry', t => {
    const sandbox = sandboxed(t)
    const app = createApp(sandbox, { dir: 'lib', repos: { logger: 'roosevelt-logger@1.0.1' } })

    const result = run(app)

    assert.equal(result.status, 0, result.output)
    assert.equal(installedVersion(path.join(app, 'lib/logger')), '1.0.1')
    assert.ok(!fs.existsSync(path.join(app, 'lib/logger/.git')), 'a registry package is not a git clone')
  })

  await t.test('resolves a semver range from the registry', t => {
    const sandbox = sandboxed(t)
    const app = createApp(sandbox, { dir: 'lib', repos: { logger: 'roosevelt-logger@^1.0.0' } })

    const result = run(app)

    assert.equal(result.status, 0, result.output)
    assert.match(installedVersion(path.join(app, 'lib/logger')), /^1\./)
  })

  await t.test('re-extracts when what is on disk cannot be read', t => {
    const sandbox = sandboxed(t)
    const app = createApp(sandbox, { dir: 'lib', repos: { logger: 'roosevelt-logger@1.0.1' } })
    run(app)
    fs.writeFileSync(path.join(app, 'lib/logger/package.json'), 'not json at all')

    const result = run(app)

    assert.equal(result.status, 0, result.output)
    assert.equal(installedVersion(path.join(app, 'lib/logger')), '1.0.1', 'the package should have been extracted again')
  })

  await t.test('leaves an already extracted package alone', t => {
    const sandbox = sandboxed(t)
    const app = createApp(sandbox, { dir: 'lib', repos: { logger: 'roosevelt-logger@1.0.1' } })
    run(app)

    const result = run(app)

    assert.match(result.output, /already at version 1\.0\.1/)
  })

  await t.test('falls back from an unreachable git spec to a registry spec', t => {
    const sandbox = sandboxed(t)
    const app = createApp(sandbox, {
      dir: 'lib',
      repos: { logger: [gitUrl(path.join(sandbox, 'missing.git')), 'roosevelt-logger@1.0.1'] }
    })

    const result = run(app)

    assert.equal(result.status, 0, result.output)
    assert.equal(installedVersion(path.join(app, 'lib/logger')), '1.0.1')
  })
})

test('configuration', async t => {
  await t.test('reads repos from a reposFile', t => {
    const sandbox = sandboxed(t)
    const repo = versionedRepo(sandbox)
    const app = createApp(sandbox, { dir: 'lib', reposFile: 'fallback-dependencies.json' }, {
      reposFile: { name: 'fallback-dependencies.json', contents: { dep: repo.url } }
    })

    const result = run(app)

    assert.equal(result.status, 0, result.output)
    assert.ok(fs.existsSync(path.join(app, 'lib/dep/.git')))
  })

  await t.test('merges repos and reposFile', t => {
    const sandbox = sandboxed(t)
    const inline = createRepo(sandbox, 'inline', [{ files: { 'package.json': { name: 'inline', version: '1.0.0' } } }])
    const fromFile = createRepo(sandbox, 'fromfile', [{ files: { 'package.json': { name: 'fromfile', version: '1.0.0' } } }])
    const app = createApp(sandbox, {
      dir: 'lib',
      reposFile: 'fallback-dependencies.json',
      repos: { inline: inline.url }
    }, { reposFile: { name: 'fallback-dependencies.json', contents: { fromfile: fromFile.url } } })

    run(app)

    assert.ok(fs.existsSync(path.join(app, 'lib/inline')), 'the inline repo was not fetched')
    assert.ok(fs.existsSync(path.join(app, 'lib/fromfile')), 'the reposFile repo was not fetched')
  })

  await t.test('reports a reposFile that cannot be read', t => {
    const sandbox = sandboxed(t)
    const repo = versionedRepo(sandbox)
    const app = createApp(sandbox, { dir: 'lib', reposFile: 'missing.json', repos: { dep: repo.url } })

    const result = run(app)

    assert.match(result.output, /Could not load fallbackDependencies.reposFile/)
    assert.ok(fs.existsSync(path.join(app, 'lib/dep')), 'the inline repos should still be fetched')
  })

  await t.test('removes stale directories when asked', t => {
    const sandbox = sandboxed(t)
    const repo = versionedRepo(sandbox)
    const app = createApp(sandbox, { dir: 'lib', removeStaleDirectories: true, repos: { dep: repo.url } })
    run(app)
    fs.mkdirSync(path.join(app, 'lib/stale'), { recursive: true })

    run(app)

    assert.ok(!fs.existsSync(path.join(app, 'lib/stale')), 'the stale directory should have been removed')
    assert.ok(fs.existsSync(path.join(app, 'lib/dep')), 'the live dependency should have been kept')
  })

  await t.test('keeps directories named by a directOnly dependency when removing stale ones', t => {
    const sandbox = sandboxed(t)
    const repo = versionedRepo(sandbox)
    const app = createApp(sandbox, {
      dir: 'lib',
      removeStaleDirectories: true,
      repos: { 'dep:directOnly': repo.url }
    })

    run(app)
    run(app)

    assert.ok(fs.existsSync(path.join(app, 'lib/dep')), 'a directOnly dependency should not be treated as stale')
  })

  await t.test('skips a directOnly dependency when invoked from another install', t => {
    const sandbox = sandboxed(t)
    const repo = versionedRepo(sandbox)
    const app = createApp(sandbox, { dir: 'lib', repos: { 'dep:directOnly': repo.url } }, { listType: 'fallbackDevDependencies' })

    const result = run(app, { FALLBACK_DEPENDENCIES_INITIATED_COMMAND: 'true' })

    assert.match(result.output, /Skipping dep because it is not a direct dependency/)
    assert.ok(!fs.existsSync(path.join(app, 'lib/dep')), 'a directOnly dependency should not be fetched indirectly')
  })

  await t.test('processes fallbackDevDependencies as well as fallbackDependencies', t => {
    const sandbox = sandboxed(t)
    const repo = versionedRepo(sandbox)
    const app = createApp(sandbox, { dir: 'lib', repos: { dep: repo.url } }, { listType: 'fallbackDevDependencies' })

    const result = run(app)

    assert.equal(result.status, 0, result.output)
    assert.ok(fs.existsSync(path.join(app, 'lib/dep/.git')))
  })

  await t.test('does nothing when no fallback dependencies are declared', t => {
    const sandbox = sandboxed(t)
    const app = createApp(sandbox, {})

    const result = run(app)

    assert.equal(result.status, 0, result.output)
  })
})

test('installing the dependencies of a dependency', async t => {
  // a repo carrying a lockfile is the trigger for running npm ci inside a fetched dependency
  function repoWithLockfile (sandbox, name = 'dep') {
    return createRepo(sandbox, name, [{
      files: {
        'package.json': { name, version: '1.0.0' },
        'package-lock.json': { name, lockfileVersion: 3, requires: true, packages: { '': { name, version: '1.0.0' } } }
      }
    }])
  }

  await t.test('runs npm ci when the dependency ships a lockfile', t => {
    const sandbox = sandboxed(t)
    const repo = repoWithLockfile(sandbox)
    const app = createApp(sandbox, { dir: 'lib', repos: { dep: repo.url } })

    const result = run(app)

    assert.match(result.output, /Running npm ci on/)
  })

  await t.test('skips npm ci when the spec ends in -skip-deps', t => {
    const sandbox = sandboxed(t)
    const repo = repoWithLockfile(sandbox)
    const app = createApp(sandbox, { dir: 'lib', repos: { dep: `${repo.url} -skip-deps` } })

    const result = run(app)

    assert.equal(result.status, 0, result.output)
    assert.doesNotMatch(result.output, /Running npm ci on/)
    assert.ok(fs.existsSync(path.join(app, 'lib/dep/.git')), 'the repo should still be cloned')
  })

  await t.test('reruns npm ci on an unchanged dependency when asked', t => {
    const sandbox = sandboxed(t)
    const repo = repoWithLockfile(sandbox)
    const app = createApp(sandbox, { dir: 'lib', rerunNpmCi: true, repos: { dep: repo.url } })
    run(app)

    const result = run(app)

    assert.match(result.output, /Already up to date/)
    assert.match(result.output, /Running npm ci on/, 'npm ci should run again despite being up to date')
  })

  await t.test('reports a failure to install a dependency without failing the whole run', t => {
    const sandbox = sandboxed(t)
    const repo = createRepo(sandbox, 'dep', [{
      files: {
        'package.json': { name: 'dep', version: '1.0.0' },
        'package-lock.json': 'this is not a lockfile'
      }
    }])
    const app = createApp(sandbox, { dir: 'lib', repos: { dep: repo.url } })

    const result = run(app)

    assert.equal(result.status, 0, 'a dependency that fails to install should not abort the run')
    assert.match(result.output, /unable to install dependencies for: dep/)
  })

  await t.test('passes npmCiArgs through as a string or an array', t => {
    const sandbox = sandboxed(t)
    const repo = repoWithLockfile(sandbox)

    const asString = createApp(sandbox, { dir: 'lib', npmCiArgs: '--no-audit --no-fund', repos: { dep: repo.url } }, { name: 'string-app' })
    assert.equal(run(asString).status, 0)

    const asArray = createApp(sandbox, { dir: 'lib', npmCiArgs: ['--no-audit', '--no-fund'], repos: { dep: repo.url } }, { name: 'array-app' })
    assert.equal(run(asArray).status, 0)
  })
})

test('rejected specs', async t => {
  await t.test('explains that the legacy -b syntax was removed', t => {
    const sandbox = sandboxed(t)
    const repo = versionedRepo(sandbox)
    const app = createApp(sandbox, { dir: 'lib', repos: { dep: `${repo.url} -b v1.0.0` } })

    const result = run(app)

    assert.equal(result.status, 1)
    assert.match(result.output, /syntax that was removed in fallback-dependencies 2\.0\.0/)
  })

  await t.test('explains that a bare local path must be a git+file url', t => {
    const sandbox = sandboxed(t)
    const repo = versionedRepo(sandbox)
    const app = createApp(sandbox, { dir: 'lib', repos: { dep: repo.bare } })

    const result = run(app)

    assert.equal(result.status, 1)
    assert.match(result.output, /use a git\+file:\/\/ url/)
  })
})

test('the git sanity check', async t => {
  await t.test('fails when git does not behave as expected', { skip: skipShim }, t => {
    const sandbox = sandboxed(t)
    const repo = versionedRepo(sandbox)
    const app = createApp(sandbox, { dir: 'lib', repos: { dep: repo.url } })
    // git with no arguments prints help and exits 1; anything else means git is not usable
    const fakePath = fakeGitPath(sandbox, '#!/bin/sh\nexit 0\n')

    const result = run(app, { PATH: fakePath, Path: fakePath })

    assert.equal(result.status, 1)
    assert.match(result.output, /git process failed with code 0/)
  })

  await t.test('fails when git is not installed at all', t => {
    const sandbox = sandboxed(t)
    const repo = versionedRepo(sandbox)
    const app = createApp(sandbox, { dir: 'lib', repos: { dep: repo.url } })
    // an empty directory as the whole PATH, so spawning git raises ENOENT
    const emptyBin = path.join(sandbox, 'emptybin')
    fs.mkdirSync(emptyBin, { recursive: true })

    const result = run(app, { PATH: emptyBin, Path: emptyBin })

    assert.equal(result.status, 1)
    assert.match(result.output, /ENOENT/)
  })

  await t.test('kills the check when git hangs', { skip: skipShim }, t => {
    const sandbox = sandboxed(t)
    const repo = versionedRepo(sandbox)
    const app = createApp(sandbox, { dir: 'lib', repos: { dep: repo.url } })
    // exec so the shell process is replaced by sleep and killing it actually reaps the sleep
    const fakePath = fakeGitPath(sandbox, '#!/bin/sh\nexec sleep 30\n')

    const result = run(app, { PATH: fakePath, Path: fakePath })

    assert.equal(result.status, 1)
    assert.match(result.output, /Process killed due to timeout/)
  })
})

test('npm configuration', async t => {
  // a scoped registry is a good probe: npm never exports scoped registry config to lifecycle scripts, so honoring it proves the .npmrc itself was read
  const unreachable = 'http://127.0.0.1:1/'

  await t.test('honors a scoped registry from a project .npmrc', t => {
    const sandbox = sandboxed(t)
    const app = createApp(sandbox, { dir: 'lib', repos: { thing: '@fdtest/thing@1.0.0' } })
    fs.writeFileSync(path.join(app, '.npmrc'), `@fdtest:registry=${unreachable}\nfetch-retries=0\n`)

    const result = run(app)

    assert.equal(result.status, 1)
    assert.match(result.output, /127\.0\.0\.1:1/, 'the scoped registry from .npmrc should have been used')
  })

  await t.test('expands environment variables in .npmrc values', t => {
    const sandbox = sandboxed(t)
    const app = createApp(sandbox, { dir: 'lib', repos: { thing: '@fdtest/thing@1.0.0' } })
    const reference = '$' + '{FD_TEST_REGISTRY}' // split so the linter does not read it as a template literal
    fs.writeFileSync(path.join(app, '.npmrc'), `@fdtest:registry=${reference}\nfetch-retries=0\n`)

    const result = run(app, { FD_TEST_REGISTRY: unreachable })

    assert.equal(result.status, 1)
    assert.match(result.output, /127\.0\.0\.1:1/, 'the environment variable reference should have been expanded')
  })
})

test('building git dependencies', async t => {
  // npm runs a git dependency's prepare script on install, which is how packages that ship from source get built
  function buildableRepo (sandbox) {
    return createRepo(sandbox, 'needsbuild', [{
      files: {
        'package.json': {
          name: 'needsbuild',
          version: '1.0.0',
          scripts: { prepare: 'node -e "require(\'fs\').writeFileSync(\'BUILT.txt\', \'built\')"' }
        }
      }
    }])
  }

  await t.test('runs the prepare script the way npm does', t => {
    const sandbox = sandboxed(t)
    const repo = buildableRepo(sandbox)
    const app = createApp(sandbox, { dir: 'lib', repos: { needsbuild: `${repo.url}#main` } })

    const result = run(app)

    assert.equal(result.status, 0, result.output)
    assert.ok(fs.existsSync(path.join(app, 'lib/needsbuild/BUILT.txt')), 'the prepare script should have been run')
  })

  await t.test('skips the build when skipPrepare is set', t => {
    const sandbox = sandboxed(t)
    const repo = buildableRepo(sandbox)
    const app = createApp(sandbox, { dir: 'lib', skipPrepare: true, repos: { needsbuild: `${repo.url}#main` } })

    const result = run(app)

    assert.equal(result.status, 0, result.output)
    assert.ok(!fs.existsSync(path.join(app, 'lib/needsbuild/BUILT.txt')), 'skipPrepare should have prevented the build')
  })

  await t.test('skips the build when the environment variable is set', t => {
    const sandbox = sandboxed(t)
    const repo = buildableRepo(sandbox)
    const app = createApp(sandbox, { dir: 'lib', repos: { needsbuild: `${repo.url}#main` } })

    run(app, { FALLBACK_DEPENDENCIES_SKIP_PREPARE: 'true' })

    assert.ok(!fs.existsSync(path.join(app, 'lib/needsbuild/BUILT.txt')), 'the environment variable should have prevented the build')
  })

  await t.test('skips the build when the spec opts out of dependencies', t => {
    const sandbox = sandboxed(t)
    const repo = buildableRepo(sandbox)
    const app = createApp(sandbox, { dir: 'lib', repos: { needsbuild: `${repo.url}#main -skip-deps` } })

    run(app)

    assert.ok(!fs.existsSync(path.join(app, 'lib/needsbuild/BUILT.txt')), '-skip-deps should have prevented the build')
  })

  await t.test('does not build a dependency that has no prepare script', t => {
    const sandbox = sandboxed(t)
    const repo = versionedRepo(sandbox)
    const app = createApp(sandbox, { dir: 'lib', repos: { dep: `${repo.url}#main` } })

    const result = run(app)

    assert.equal(result.status, 0, result.output)
    assert.doesNotMatch(result.output, /prepare script/)
  })
})
