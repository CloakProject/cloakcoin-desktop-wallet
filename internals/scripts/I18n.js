// @flow
import path from 'path'
import vfs from 'vinyl-fs'
import scanner from 'i18next-scanner'
import * as fs from 'fs'
import { availableLanguages, availableNamespaces } from '../../app/i18next.config'

function convertPathToNamespace(filePath) {
  if (filePath === '/menu.js') {
    return 'menu'
  }

  const namespace = availableNamespaces.filter(
    ns => filePath.split(path.sep).includes(ns)
  ).pop() || 'other'

  return namespace
}

const scannerOptions = {
  debug: false,
  attr: {
    // Disable attribute parsing
    extensions: [],
  },
  func: {
    // Disable function parsing, we will do that ourselves from transform()
    extensions: []
  },
  trans: {
    // Disable Trans component parsing
    extensions: [],
  },
  lngs: availableLanguages,
  ns: availableNamespaces,
  defaultNs: 'other',
  defaultValue: (language, namespace, key) => key,
  resource: {
    loadPath: './locales/{{lng}}/{{ns}}.json',
    savePath: './{{lng}}/{{ns}}.json'
  },
  nsSeparator: false,
  keySeparator: false,
  interpolation: {
    prefix: '{{',
    suffix: '}}'
  }
}

function transform(file, enc, done) {
  const { parser } = this
  const content = fs.readFileSync(file.path, enc);

  const funcOptions = {
    list: ['i18next.t', 'i18n.t', 'this.t', 't'],
    extensions: ['.js', '.jsx']
  }

  const appPath = path.join(__dirname, '../../app')
  const relativePath = file.path.slice(appPath.length)
  const namespace = convertPathToNamespace(relativePath)
  let hasKeys = false

  parser.parseFuncFromString(content, funcOptions, (key, options) => {
    hasKeys = true
    parser.set(key, Object.assign({}, options, {
      removeUnusedKeys: namespace !== 'validation',
      ns: namespace
    }))
  })

  if (hasKeys) {
    console.log(`[${namespace}] ${relativePath}...`)
  }

  done()
}

vfs.src(['./app/**/*.js', '!./app/node_modules/**/*', '!./app/dist/**/*.js', '!./app/i18n/**/*.js'])
  .pipe(scanner(scannerOptions, transform))
  .pipe(vfs.dest('./locales/'))
