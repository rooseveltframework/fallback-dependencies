# fallback-dependencies

[![Build Status](https://github.com/rooseveltframework/fallback-dependencies/workflows/CI/badge.svg
)](https://github.com/rooseveltframework/fallback-dependencies/actions?query=workflow%3ACI) [![codecov](https://codecov.io/gh/rooseveltframework/fallback-dependencies/branch/master/graph/badge.svg)](https://codecov.io/gh/rooseveltframework/fallback-dependencies) [![npm](https://img.shields.io/npm/v/fallback-dependencies.svg)](https://www.npmjs.com/package/fallback-dependencies)

A Node.js module that allows you to add git repo dependencies to your Node.js app from a cascading list of fallback locations. This module was built and is maintained by the [Roosevelt web framework](https://github.com/rooseveltframework/roosevelt) [team](https://github.com/orgs/rooseveltframework/people), but it can be used independently of Roosevelt as well.

## Why?

You might be wondering: why not use a private npm registry, let npm clone git repos directly, or use some other package manager?

Here are some reasons why the fallback-dependencies technique might work out better for your app:

- Private npm registries can be difficult to set up and maintain. But private git repos are easy to setup and maintain.
- Installing dependencies of an app that uses a private npm registry adds extra steps to your build process which can be fussy for your app's users to configure correctly.
- There is no straightforward way to use npm to consume private packages from multiple fallback locations if the primary URL goes down or you want to limit access to some domains to some users of your app.
- There is no way to install git repos via npm if the repo in question does not have a package.json, but with fallback-dependencies, you can.
- If you consume git repos directly with npm, it will deposit those repos into the `node_modules` folder which could result in naming collisions or just make those repos feel excessively buried if you want more convenient access to the private repos' files. The `node_modules` folder is also an inappropriate place to deposit dependencies that aren't Node.js modules, which as noted above are possible to fetch with fallback-dependencies. With fallback-dependencies, you can decide where to deposit them.

Simplifying the developer experience is the main goal here. With fallback-dependencies, all a user of your app has to do is:

- Have an account in good standing with at least one of the fallback URLs for each fallback-dependency in the app's dependency list.
- Clone your app.
- `npm ci`.

That's it. The app will start now. All the alternative approaches add additional complex steps to the build process that make the developer experience more cumbersome.

So if you want to minimize the number of steps that need to be followed to install private dependencies in your Node.js app, then you might want to consider using `fallback-dependencies`.

## Usage

First declare `fallback-dependencies` as a dependency of your app.

### Declare fallback-dependencies

Next, add a `fallbackDependencies` entry to your `package.json` alongside your `dependencies`, `devDependencies`, etc, e.g.:

```js
"fallbackDependencies": {
  "dir": "lib",
  "repos": {
    "some-private-dependency": [
      "https://some.private.git.repo.somewhere",
      "https://some.private.git.repo.somewhere.else"
    ],
    "some-other-private-dependency": [
      "https://some.other.private.git.repo.somewhere",
      "https://some.other.private.git.repo.somewhere.else"
    ]
  }
}
```

#### API

- `dir` *[String]*: What directory to deposit fallback-dependencies into.

  - Default: `fallback_dependencies`.

- `repos` *[Object]* of *[Arrays]* of *[Strings]*: A list of dependencies similar to the `dependencies` field in package.json, but instead of supplying a string for where to fetch it, you supply an array of strings of possible locations to fetch it from. This script will attempt to fetch it from the first location, then if that fails will fallback to the second possible place to get it from, and so on until it runs out of places to try.

  - Default: `{}`.

- `reposFile` *[String]*: Relative path to a JSON file that contains a list of repos formatted the same as the `repos` entry. If both `repos` and `reposFile` are supplied, the two lists will be merged.

  - Default: `{}`.

  - Example:

    ```js
    // fallback-dependencies.json
    {
      "some-private-dependency": [
        "https://some.private.git.repo.somewhere",
        "https://some.private.git.repo.somewhere.else"
      ],
      "some-other-private-dependency": [
        "https://some.other.private.git.repo.somewhere",
        "https://some.other.private.git.repo.somewhere.else"
      ]
    }
    ```

All params are optional, but the module won't do anything unless you supply at least `repos` or `reposFile`.

### Fetch fallback-dependencies with a postinstall script

Lastly, add a `postinstall` script to your npm scripts to execute the `fallback-dependencies` script after you install other dependencies:

```js
"scripts": {
  "postinstall": "node node_modules/fallback-dependencies/fallback-dependencies.js"
},
```

You can also write your `postinstall` script to fail silently if the fallback-dependencies.js file is not found for whatever reason, e.g.:

```js
"scripts": {
  "postinstall": "node -e \"try { require('child_process').spawnSync('node', ['node_modules/fallback-dependencies/fallback-dependencies.js'], { stdio: 'ignore' }) } catch (e) {}\""
},
```

Writing the `postinstall` script that way might be a little ugly, but it's useful to do it this way if `fallback-dependencies` is a `devDependency` of your app and you don't want the `postinstall` script to fail when you do a production dependencies-only build.

### Configuration

#### Clone a specific version of your fallback-dependency

To version your fallback-dependencies, you should use git tags to stamp versions onto your commits. To clone a specific git tag, add `-b tag_name` to the URL, e.g. `"https://some.private.git.repo.somewhere -b 1.0.5"`.

#### Fetch devDependencies of your fallback-dependencies

By default, `fallback-dependencies` will not install the `devDependencies` of a given repo that is cloned. If you want to do so for any repo, put it in a `fallbackDevDependencies` block instead of a `fallbackDependencies` block in your `package.json`.

#### Prevent installing dependencies of fallback-dependencies

To skip installing dependencies for a specific fallback-dependency, add ` -skip-deps` to the end of the URL string, e.g. `"https://some.private.git.repo.somewhere -b 1.0.5 -skip-deps"`.

#### Prevent a fallback-dependency from installing its own fallback-dependencies

To prevent a fallback-dependency from being installed in a situation where the repo is not a direct dependency of the root project, append the `:directOnly` flag to the end of the dependency name, e.g. `"some-private-dependency:directOnly": [ ... ] `. This will prevent repos with nested fallback-dependencies from installing their own fallback-dependencies.

#### Let users prioritize URL list differently

To move a preferred domain up to the top of the list of fallback-dependencies to try regardless of the order specified in the app's config, set the environment variable `FALLBACK_DEPENDENCIES_PREFERRED_WILDCARD` to a string to match in the URL list.

## Drawbacks to using fallback-dependencies

- The fallback-dependencies module is not a standard endorsed by or maintained by the Node.js or npm teams. You're relying on the maintainers of this project to ensure that it keeps working. You can of course just fork this project if you want to do it some other way as well though.
- You may need to set up git to authenticate against the URL(s) you're cloning from, which can present a similar degree of cumbersomeness to fetching these dependencies from a private npm registry or similar. We think in most cases git authentication is less annoying than the other methods though, particularly if you've already needed to do this authentication to clone the main project.
- Your build process will likely be slower because it will need to build at least two separate dependency trees.
- Doing it this way will likely increase your total disk space usage for dependencies since you will likely have multiple copies of the same dependency in the separate dependency trees, particularly if you pile up a lot of fallback-dependencies.
- Using this technique instead of setting up something like a private npm registry might make you feel less cool because this approach is more straightforward, more flexible, less over-engineered, and a lot of us programmers are addicted to needless complexity. If you want a super complicated build process to make you feel smart, this module won't help you with that.
