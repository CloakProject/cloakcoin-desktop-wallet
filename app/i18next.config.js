import i18n from 'i18next'
import path from 'path'
import { reactI18nextModule } from 'react-i18next'
import i18nextBackend from 'i18next-node-fs-backend'

import { getResourcesPath } from './utils/os'

const availableLanguages = ['en', 'eo']

const availableNamespaces = [
  'get-started',
  'overview',
  'own-addresses',
  'address-book',
  'send-cash',
  'settings',
  'service',
  'validation',
  'menu',
  'other'
]

// const isDev = process.env.NODE_ENV === 'development'

const localesPath = (process.versions.electron
  ? path.join(getResourcesPath(), 'locales')
  : './locales')


const i18nextOptions = {
  backend:{
    loadPath: path.join(localesPath, '{{lng}}', '{{ns}}.json'),
    addPath: path.join(localesPath, '{{lng}}', '{{ns}}.missing.json'),
    jsonIndent: 2,
  },
  interpolation: {
    escapeValue: false
  },
  debug: false, // isDev,
  saveMissing: false, // isDev,
  fallbackLng: 'en',
  whitelist: availableLanguages,
  keySeparator: false,
  nsSeparator: false,
  ns: availableNamespaces,
  react: {
    wait: true,
    bindI18n: 'languageChanged loaded'
  }
};

i18n
  .use(i18nextBackend)
  .use(reactI18nextModule)

if (!i18n.isInitialized) {
  i18n.init(i18nextOptions)
}

function translate(namespaces) {
  return namespaces
    ? i18n.getFixedT(null, namespaces)
    : i18n.t.bind(i18n)
}

export {
  i18n,
  translate,
  availableLanguages,
  availableNamespaces
}
