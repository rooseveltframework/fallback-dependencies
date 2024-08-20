# Changelog

## Next version

- Put your changes here...

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
