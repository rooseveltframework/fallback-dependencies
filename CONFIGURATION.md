## Clone a specific version of your fallback-dependency

To version your fallback-dependencies, you should use git tags to stamp versions onto your commits. To clone a specific git tag, add `-b tag_name` to the URL, e.g. `"https://some.private.git.repo.somewhere -b 1.0.5"`. You also have the option to clone specific branch names commit IDs, providing enhanced control over your project's versions, e.g. `"https://some.private.git.repo.somewhere -b branch_name"` or `"https://some.private.git.repo.somewhere -b commit_id"`. In the case that a tag and branch have the same name, the tagged version will take precedence.

## Fetch devDependencies of your fallback-dependencies

By default, `fallback-dependencies` will not install the `devDependencies` of a given repo that is cloned. If you want to do so for any repo, put it in a `fallbackDevDependencies` block instead of a `fallbackDependencies` block in your `package.json`.

## Prevent installing dependencies of fallback-dependencies

To skip installing dependencies for a specific fallback-dependency, add ` -skip-deps` to the end of the URL string, e.g. `"https://some.private.git.repo.somewhere -b 1.0.5 -skip-deps"`.

## Prevent a fallback-dependency from installing its own fallback-dependencies

To prevent a fallback-dependency from being installed in a situation where the repo is not a direct dependency of the root project, append the `:directOnly` flag to the end of the dependency name, e.g. `"some-private-dependency:directOnly": [ ... ] `. This will prevent repos with nested fallback-dependencies from installing their own fallback-dependencies.

## Let users prioritize URL list differently

To move a preferred domain up to the top of the list of fallback-dependencies to try regardless of the order specified in the app's config, set the environment variable `FALLBACK_DEPENDENCIES_PREFERRED_WILDCARD` to a string to match in the URL list.

## Run `npm ci` on already cloned repos

To run `npm ci` on clones even if they already exist, set the environment variable `FALLBACK_DEPENDENCIES_RERUN_NPM_CI` to `true` or set `rerunNpmCi` in `fallbackDependencies` package.json config.

## Add arguments to `npm ci`

To include additional arguments to pass to the `npm ci` command, set the environment variable, `FALLBACK_DEPENDENCIES_NPM_CI_ARGS` to a string separating each argument with a space, e.g. `--no-audit --silent`, or an array of strings, e.g. `['--no-audit', --silent]` or set `npmCiArgs` in `fallbackDependencies` package.json config.

## Remove stale directories from dependency target folder

To remove stale directories from the dependency target folder, set the environment variable `FALLBACK_DEPENDENCIES_REMOVE_STALE_DIRECTORIES` to `true`.
