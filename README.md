[![npm](https://img.shields.io/npm/v/fallback-dependencies.svg)](https://www.npmjs.com/package/fallback-dependencies)

A Node.js module that allows you to add git repo dependencies to your Node.js app from a cascading list of fallback locations.

This module was built and is maintained by the [Roosevelt web framework](https://rooseveltframework.org) [team](https://rooseveltframework.org/contributors), but it can be used independently of Roosevelt as well.

<details open>
  <summary>Documentation</summary>
  <ul>
    <li><a href="./USAGE.md">Usage</a></li>
    <li><a href="./CONFIGURATION.md">CONFIGURATION</a></li>
  </ul>
</details>

## Why?

You might be wondering: why not use a private npm registry, let npm clone git repos directly, or use some other package manager?

Here are some reasons why you might need fallback-dependencies for certain types of apps:

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

## Caveats

- The fallback-dependencies module is not a standard endorsed by or maintained by the Node.js or npm teams. You're relying on the maintainers of this project to ensure that it keeps working. You can of course just fork this project if you want to do it some other way as well though.
- You may need to set up git to authenticate against the URL(s) you're cloning from, which can present a similar degree of cumbersomeness to fetching these dependencies from a private npm registry or similar. We think in most cases git authentication is less annoying than the other methods though, particularly if you've already needed to do this authentication to clone the main project.
- Your build process will likely be slower because it will need to build at least two separate dependency trees.
- Doing it this way will likely increase your total disk space usage for dependencies since you will likely have multiple copies of the same dependency in the separate dependency trees, particularly if you pile up a lot of fallback-dependencies.
- Using this technique instead of setting up something like a private npm registry might make you feel less cool because this approach is more straightforward, more flexible, less over-engineered, and a lot of us programmers are addicted to needless complexity. If you want a super complicated build process to make you feel smart, this module won't help you with that.
