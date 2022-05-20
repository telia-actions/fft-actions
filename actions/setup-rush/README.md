# Setup-rush

Installs [Rush](https://rushjs.io/), using [actions/cache](https://github.com/actions/cache) to speed up future workflow runs.

`rush` is not installed globally - you should still run it via `install-run-rush.js` even after executing this action.

## Pre-requisites

### Runner setup

- `bash`, `grep`, and `cut` are available on your runner (installed by default)
- Node is installed (e.g. [actions/setup-node](https://github.com/actions/setup-node))

### Repository setup

This should all be done already in a normal Rush monorepository.

- `rush.json` is present in the working directory and contains a `rushVersion` field
- `common/config/rush/.npmrc` (or global configuration) is set up to access your desired NPM registry
- `common/scripts/install-run-rush.js` and `common/scripts/install-run.js` exist and is up-to-date with the desired Rush version.
