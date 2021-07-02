# fallback-dependencies

[![Build Status](https://github.com/rooseveltframework/fallback-dependencies/workflows/CI/badge.svg
)](https://github.com/rooseveltframework/fallback-dependencies/actions?query=workflow%3ACI) [![codecov](https://codecov.io/gh/rooseveltframework/fallback-dependencies/branch/master/graph/badge.svg)](https://codecov.io/gh/rooseveltframework/fallback-dependencies) [![npm](https://img.shields.io/npm/v/fallback-dependencies.svg)](https://www.npmjs.com/package/fallback-dependencies)

A Node.js module that allows you to add git repo dependencies to your Node.js app from a cascading list of fallback locations. This module was built and is maintained by the [Roosevelt web framework](https://github.com/rooseveltframework/roosevelt) [team](https://github.com/orgs/rooseveltframework/people), but it can be used independently of Roosevelt as well.

## Usage

First declare `fallback-dependencies` as a dependency in your app.

Then add a `fallbackDependencies` entry to your `package.json` alongside your `dependencies`, `devDependencies`, etc.

Here's an example:

```js
"fallbackDependencies": {
  "dir": "lib",
  "overwrite": true,
  "repos": {
    "some-private-dependency": [
      "https://some.private.git.repo.somewhere",
      "https://some.private.git.repo.somewhere.else",
    ],
    "some-other-private-dependency": [
      "https://some.other.private.git.repo.somewhere",
      "https://some.other.private.git.repo.somewhere.else",
    ]
  }
}
```

### API

- `dir` *[String]*: What directory to deposit fallback dependencies into.
  - Default: `fallback_dependencies`
- `overwrite` *[Boolean]*: Whether or not to replace existing clones of fallback dependencies with new clones when the script is re-run.
  - Default: `false`
- `repos` *[Object]* of *[Arrays]* of *[Strings]*: A list of dependencies similar to the `dependencies` field in package.json, but instead of supplying a string for where to fetch it, you supply an array of strings of possible locations to fetch it from. This script will attempt to fetch it from the first location, then if that fails will fallback to the second possible place to get it from, and so on until it runs out of places to try.
  - Default: `{}`
