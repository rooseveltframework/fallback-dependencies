## Clone a specific version of your fallback-dependency

To version your fallback-dependencies, you should use git tags to stamp versions onto your commits. To clone a specific git tag, add `-b tag_name` to the URL, e.g. `"https://some.private.git.repo.somewhere -b 1.0.5"`.

## Fetch devDependencies of your fallback-dependencies

By default, `fallback-dependencies` will not install the `devDependencies` of a given repo that is cloned. If you want to do so for any repo, put it in a `fallbackDevDependencies` block instead of a `fallbackDependencies` block in your `package.json`.

## Prevent installing dependencies of fallback-dependencies

To skip installing dependencies for a specific fallback-dependency, add ` -skip-deps` to the end of the URL string, e.g. `"https://some.private.git.repo.somewhere -b 1.0.5 -skip-deps"`.

## Prevent a fallback-dependency from installing its own fallback-dependencies

To prevent a fallback-dependency from being installed in a situation where the repo is not a direct dependency of the root project, append the `:directOnly` flag to the end of the dependency name, e.g. `"some-private-dependency:directOnly": [ ... ] `. This will prevent repos with nested fallback-dependencies from installing their own fallback-dependencies.

## Let users prioritize URL list differently

To move a preferred domain up to the top of the list of fallback-dependencies to try regardless of the order specified in the app's config, set the environment variable `FALLBACK_DEPENDENCIES_PREFERRED_WILDCARD` to a string to match in the URL list.
