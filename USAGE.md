First declare `fallback-dependencies` as a dependency of your app.

## Declare fallback-dependencies

Next, add a `fallbackDependencies` entry to your `package.json` alongside your `dependencies`, `devDependencies`, etc, e.g.:

```js
"fallbackDependencies": {
  "dir": "lib",
  "repos": {
    "some-private-dependency": [
      "git+https://some.private.git.repo.somewhere/team/thing.git#1.0.5",
      "git+https://some.private.git.repo.somewhere.else/team/thing.git#1.0.5"
    ],
    "some-other-private-dependency": [
      "git+ssh://git@some.other.private.git.repo.somewhere/team/other.git#main",
      "github:some-org/other#main"
    ]
  }
}
```

## API

- `dir` *[String]*: What directory to deposit fallback-dependencies into. Default: `fallback_dependencies`.
- `repos` *[Object of Arrays of Strings]*: A list of dependencies similar to the `dependencies` field in package.json, but instead of supplying one [npm package spec](https://docs.npmjs.com/cli/v11/using-npm/package-spec) for where to fetch it, you supply an array of specs of possible locations to fetch it from. This script will attempt to fetch it from the first location, then if that fails will fallback to the second possible place to get it from, and so on until it runs out of places to try. See configuration docs for the spec forms that are supported. Default: `{}`.
- `reposFile` *[String]*: Relative path to a JSON file that contains a list of repos formatted the same as the `repos` entry. If both `repos` and `reposFile` are supplied, the two lists will be merged. Default: `{}`.
- `preferredWildcard` *[String]*: Domain to move up to the top of the list of fallback-dependencies to try regardless of the order specified in the app's config. Must match a string in the spec list. Default: `undefined`.
- `rerunNpmCi` *[Boolean]*: Option to run `npm ci` on clones even if they already exist. Default: `false`.
- `npmCiArgs` *[String or Array of Strings]*: Additional arguments to pass to `npm ci` command. Default: `undefined`.
- `removeStaleDirectories` *[Boolean]*: Removes stale directories from dependency target folder. Default: `false`.

Example of `reposFile` usage:

```js
// fallback-dependencies.json
{
  "some-private-dependency": [
    "git+https://some.private.git.repo.somewhere/team/thing.git#1.0.5",
    "git+https://some.private.git.repo.somewhere.else/team/thing.git#1.0.5"
  ],
  "some-other-private-dependency": [
    "git+ssh://git@some.other.private.git.repo.somewhere/team/other.git#main",
    "github:some-org/other#main"
  ]
}
```

All params are optional, but the module won't do anything unless you supply at least `repos` or `reposFile`.

## Fetch fallback-dependencies with a postinstall script

Lastly, add a `postinstall` script to your npm scripts to execute the `fallback-dependencies` script after you install other dependencies:

```js
"scripts": {
  "postinstall": "node node_modules/fallback-dependencies/fallback-dependencies.js"
},
```

You can also write your `postinstall` script to fail silently if the fallback-dependencies.js file is not found for whatever reason, e.g.:

```js
"scripts": {
  "postinstall": "node -e \"try { require('child_process').spawnSync('node', ['node_modules/fallback-dependencies/fallback-dependencies.js'], { shell: false, stdio: 'ignore' }) } catch (e) {}\""
},
```

Writing the `postinstall` script that way might be a little ugly, but it's useful to do it this way if `fallback-dependencies` is a `devDependency` of your app and you don't want the `postinstall` script to fail when you do a production dependencies-only build.
