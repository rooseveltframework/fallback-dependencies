## Declare which version of a fallback-dependency to fetch

Fallback-dependencies are declared using [npm package specs](https://docs.npmjs.com/cli/using-npm/package-spec), the same syntax npm itself accepts. Add the version you want after a `#`:

- A git tag: `"git+https://some.private.git.repo.somewhere/team/thing.git#1.0.5"`
- A branch: `"git+https://some.private.git.repo.somewhere/team/thing.git#main"`
- A commit id: `"git+https://some.private.git.repo.somewhere/team/thing.git#0f4bcd1"`
- A semver range resolved against the repo's tags: `"git+https://some.private.git.repo.somewhere/team/thing.git#semver:^1.0.0"`

If you don't specify a version, the repo's default branch is used.

When the version you name is a branch, the clone is left checked out on that branch so you can keep working in it, and subsequent runs will `git pull` it. When you name a tag, a commit id, or a semver range, the clone is checked out in a detached state at that exact commit, because those don't correspond to a branch that can move.

The following spec forms are supported:

| Form | Example |
| --- | --- |
| Full git url | `git+https://example.com/team/thing.git#1.0.5` |
| SSH git url | `git+ssh://git@example.com/team/thing.git#1.0.5` |
| GitHub / GitLab / Bitbucket shorthand | `github:rooseveltframework/teddy#1.0.5` |
| Local git repo | `git+file:///absolute/path/to/repo.git#1.0.5` |
| npm registry package | `teddy@^1.0.0` |

The transport you write is the transport that gets used, so an `ssh://` url will authenticate with your SSH key and an `https://` url will authenticate over HTTPS.

## Fetch devDependencies of your fallback-dependencies

By default, `fallback-dependencies` will not install the `devDependencies` of a given repo that is cloned. If you want to do so for any repo, put it in a `fallbackDevDependencies` block instead of a `fallbackDependencies` block in your `package.json`.

## Prevent installing dependencies of fallback-dependencies

To skip installing dependencies for a specific fallback-dependency, add ` -skip-deps` to the end of the spec string, e.g. `"git+https://some.private.git.repo.somewhere/team/thing.git#1.0.5 -skip-deps"`.

## Prevent a fallback-dependency from installing its own fallback-dependencies

To prevent a fallback-dependency from being installed in a situation where the repo is not a direct dependency of the root project, append the `:directOnly` flag to the end of the dependency name, e.g. `"some-private-dependency:directOnly": [ ... ] `. This will prevent repos with nested fallback-dependencies from installing their own fallback-dependencies.

## Let users prioritize URL list differently

To move a preferred domain up to the top of the list of fallback-dependencies to try regardless of the order specified in the app's config, set the environment variable `FALLBACK_DEPENDENCIES_PREFERRED_WILDCARD` to a string to match in the spec list.

## Run `npm ci` on already cloned repos

To run `npm ci` on clones even if they already exist, set the environment variable `FALLBACK_DEPENDENCIES_RERUN_NPM_CI` to `true` or set `rerunNpmCi` in `fallbackDependencies` package.json config.

## Add arguments to `npm ci`

To include additional arguments to pass to the `npm ci` command, set the environment variable, `FALLBACK_DEPENDENCIES_NPM_CI_ARGS` to a string separating each argument with a space, e.g. `--no-audit --silent`, or an array of strings, e.g. `['--no-audit', --silent]` or set `npmCiArgs` in `fallbackDependencies` package.json config.

## Remove stale directories from dependency target folder

To remove stale directories from the dependency target folder, set the environment variable `FALLBACK_DEPENDENCIES_REMOVE_STALE_DIRECTORIES` to `true` or set `removeStaleDirectories` in `fallbackDependencies` package.json config.
