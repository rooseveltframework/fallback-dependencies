## 2.0.0

- Breaking: dependencies are now declared using [npm package specs](https://docs.npmjs.com/cli/v11/using-npm/package-spec) instead of the `<url> -b <version>` syntax. You will need to migrate to the new syntax; dependencies declared using the old syntax are rejected with an error explaining how to update them.
  - How to migrate:
    - `"https://example.com/team/thing.git -b 1.0.5"` → `"git+https://example.com/team/thing.git#1.0.5"`
    - `"https://example.com/team/thing.git -b main"` → `"git+https://example.com/team/thing.git#main"`
    - `"https://example.com/team/thing.git -b 0f4bcd1"` → `"git+https://example.com/team/thing.git#0f4bcd1"`
    - `"/absolute/path/to/repo.git"` → `"git+file:///absolute/path/to/repo.git"`
- Breaking: minimum supported Node.js version is now 22.20.0.
- Added support for fetching fallback-dependencies from the npm registry, e.g. `"teddy@^1.0.0"`.
- Added support for resolving a version from a repo's tags with a semver range, e.g. `"#semver:^1.0.0"`.
- Added support for git hosts that npm has no shorthand for, and for `git+file://` urls. Previously only GitHub, GitLab, and Bitbucket urls could be resolved.
- Fixed the spec transport being rewritten to HTTPS, which broke authentication for repos that are only reachable over SSH.
- Updated dependencies.

## 1.1.4

- Fixed bug where attempting to checkout a new tag present only on the remote incorrectly reported the clone was already on that version.

## 1.1.3

- Added option to enable checking out rather than recloning when changing versions via `FALLBACK_DEPENDENCIES_ENABLE_CHECKOUT` environment variable or `enableCheckout` in `fallbackDependencies` package.json config.

## 1.1.2

- Fixed `FALLBACK_DEPENDENCIES_RERUN_NPM_CI` / `rerunNpmCi` setting to only apply to dependencies that have not been updated.

## 1.1.1

- Fixed bug where `npm ci` was not running on git pulls/checkouts when `FALLBACK_DEPENDENCIES_RERUN_NPM_CI` or `rerunNpmCi` is set.
- Fixed race condition where "Process killed due to timeout" error was being thrown randomly.

## 1.1.0

- Added option to pass CLI arguments to `npm ci` via `FALLBACK_DEPENDENCIES_NPM_CI_ARGS` environment variable or `npmCiArgs` in `fallbackDependencies` package.json config.
- Added option to run `npm ci` on clones even if they already exist via `FALLBACK_DEPENDENCIES_RERUN_NPM_CI` environment variable or `rerunNpmCi` in `fallbackDependencies` package.json config.
- Added option to clear out stale directories from dependency target folder via `FALLBACK_DEPENDENCIES_REMOVE_STALE_DIRECTORIES` environment variable or `removeStaleDirectories` in `fallbackDependencies` package.json config.
- Added option to set `FALLBACK_DEPENDENCIES_PREFERRED_WILDCARD` value in `fallbackDependencies` package.json config via `preferredWildcard`.
- Added support for git cloning / pulling from non-tagged commits.
- Updated various dependencies.

## 1.0.3

- Fixed bug that resulted in hard to understand errors if `git` wasn't functioning properly on your system.
- Updated various dependencies.

## 1.0.2

- Fixed bug causing old dependencies to be removed unnecessary.
- Fixed fallbacks not working.
- Updated various dependencies.

## 1.0.1

- Refactored some code to tighten some things up.
- Updated various dependencies.

## 1.0.0

- Altered fallbackDependencies to no longer install devDependencies of a given repo. You can restore this behavior by declaring it in fallbackDevDependencies instead.
- Added support for FALLBACK_DEPENDENCIES_PREFERRED_WILDCARD environment variable to move a preferred domain up to the top of list of fallback dependencies to try regardless of the order specified in the app's config.
- Updated various dependencies.

## 0.1.6

- Backed out `--omit=dev` change from 0.1.5 that prevented fallback-dependencies from installing devDependencies of a given repo.

## 0.1.5

- fallback-dependencies will now detect if your clone is out of date in the case of `-b` versioned entries. If it's out of date, it will remove the old clone and re-clone it.
- fallback-dependencies will no longer install devDependencies of a given repo.

## 0.1.4

- You can now prevent a fallback-dependency from being installed in a situation where the repo is not a direct dependency of the root project by appending the `:directOnly` flag to the end of the dependency name.
- Various dependencies updated.

## 0.1.3

- You can now skip installing dependencies of a fallback-dependency by appending the ` -skip-deps` flag to the end of the dependency.
- Various dependencies updated.

## 0.1.2

- Added some detection of clones sourced from specific git tags to display a more helpful error message when trying to update non-updatable clones.
- Various dependencies updated.

## 0.1.1

- Added feature to source repo locations from a separate, external file.
- Various dependencies updated.

## 0.1.0

- Initial version.
