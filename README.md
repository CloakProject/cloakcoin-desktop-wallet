# CloakCoin Desktop Wallet V3.0

### An `Electron` native client app for `cloak`, cloned from [electron-react-boilerplate](https://github.com/chentsulin/electron-react-boilerplate) which  based on [React](https://facebook.github.io/react/), [Redux](https://github.com/reactjs/redux), [React Router](https://github.com/reactjs/react-router), [Webpack](http://webpack.github.io/docs/), [React Transform HMR](https://github.com/gaearon/react-transform-hmr) for rapid application development.

## Getting Started



### Installation
```bash
cd cloak-wallet
yarn
```
**Note**: If you can't use [yarn](https://github.com/yarnpkg/yarn), run `npm install`.

<hr><br>

1. Navigate to the directory you cloned the repo into.
2. Enter `npm install`

### Running

Start the app in the `dev` environment. This starts the renderer process in [**hot-module-replacement**](https://webpack.js.org/guides/hmr-react/) mode and starts a webpack dev server that sends hot updates to the renderer process:

```bash
yarn dev
# or
npm run dev
```
<hr><br>

## Internationalization
Is done using [i18next](https://www.i18next.com/) package, the configuration is stored in `./app/i18next.config.js`.
Every string displayed to the user should be wrapped with the translation function. Check [i18next documentation](https://www.i18next.com/) for
more details.

Generate locales with the following command:

```bash
$ yarn i18n
```
Locales are poured into the `./locales` directory.
<hr><br>

## Packaging

To package apps for the local platform:

```bash
yarn package 
# or
npm run package
```

To package apps for all platforms:

First, refer to [Multi Platform Build](https://www.electron.build/multi-platform-build) for dependencies.

Then,
```bash
yarn package-all
# or
npm run package-all
```

To package apps with options:

```bash
yarn package -- --[option]
# or
npm run package -- --[option]
```

To run End-to-End Test

```bash
yarn build
yarn test-e2e
# or
npm run build
npm run test-e2e
```

:bulb: You can debug your production build with devtools by simply setting the `DEBUG_PROD` env variable:
```bash
DEBUG_PROD=true npm run package
```
<hr><br>

### Testing


## Application icons
Use the following gist to generate new icons from one 1024x1024 image with transparency:
https://gist.github.com/iwuvjhdva/b6329f82a445cc563b143bf014f0c112

## How to update binaries
To be written.

## How to add modules to the project

You will need to add other modules to this boilerplate, depending on the requirements of your project. For example, you may want to add [node-postgres](https://github.com/brianc/node-postgres) to communicate with PostgreSQL database, or 
[material-ui](http://www.material-ui.com/) to reuse react UI components.

⚠️ Please read the following section before installing any dependencies ⚠️

### Module Structure

This boilerplate uses a [two package.json structure](https://github.com/electron-userland/electron-builder/wiki/Two-package.json-Structure). This means, you will have two `package.json` files.

1. `./package.json` in the root of your project
1. `./app/package.json` inside `app` folder

### Which `package.json` file to use

**Rule of thumb** is: all modules go into `./package.json` except native modules, or modules with native dependencies or peer dependencies. Native modules, or packages with native dependencies should go into `./app/package.json`.

1. If the module is native to a platform (like node-postgres), it should be listed under `dependencies` in `./app/package.json`
2. If a module is `import`ed by another module, include it in `dependencies` in `./package.json`.   See [this ESLint rule](https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-extraneous-dependencies.md). Examples of such modules are `material-ui`, `redux-form`, and `moment`.
3. Otherwise, modules used for building, testing and debugging should be included in `devDependencies` in `./package.json`.

### Further Readings

See the wiki page, [Module Structure — Two package.json Structure](https://github.com/chentsulin/electron-react-boilerplate/wiki/Module-Structure----Two-package.json-Structure) to understand what is native module, the rationale behind two package.json structure and more.

For an example app that uses this boilerplate and packages native dependencies, see [erb-sqlite-example](https://github.com/amilajack/erb-sqlite-example).

<hr><br>

### Contributing

You can add new languages here, and contribute to the translation of existing languages.

New languages are usually added when they reach 80% or more completion, and not removed from the client unless they fall below 60% for several releases.

### License
This project is licensed under the MIT License. 

