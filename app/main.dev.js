/* eslint global-require: 0, flowtype-errors/show-errors: 0 */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 *
 * @flow
 */
import * as fs from 'fs'
import path from 'path'
import config from 'electron-settings'
import { app, ipcMain, BrowserWindow } from 'electron'
import log from 'electron-log'

import { i18n } from './i18next.config'
import { getOS, getIsExitForbidden, getAppDataPath, getInstallationPath, getChildProcessesGlobal, stopChildProcesses } from './utils/os'
import { CloakService } from './service/cloak-service-main'
import { FetchLdbService } from './service/fetch-ldb-service'
import MenuBuilder from './menu'


let isExiting = false

// For the module to be imported in main, dirty, remove
const cloak = new CloakService()
const fetchLdb = new FetchLdbService()

const appDataPath = getAppDataPath()

if (!fs.existsSync(appDataPath)) {
  fs.mkdirSync(appDataPath)
}

log.transports.file.maxSize = 5 * 1024 * 1024
log.transports.file.file = path.join(appDataPath, 'reswallet.log')

let mainWindow = null

if (process.env.NODE_ENV === 'production') {
  // Just to be explicit, warn is the default
  log.transports.file.level = 'warn'
  log.transports.console.level = 'warn'

  const sourceMapSupport = require('source-map-support')
  sourceMapSupport.install()
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  log.transports.file.level = 'debug'
  log.transports.console.level = 'debug'

  require('electron-debug')()
  const p = path.join(__dirname, '..', 'app', 'node_modules')
  require('module').globalPaths.push(p)
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer')
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS']

  return Promise.all(
    extensions.map(name => installer.default(installer[name], forceDownload))
  ).catch(console.log)
}

const checkAndCreateWalletAppFolder = () => {
  const walletAppFolder = path.join(app.getPath('appData'), 'CloakWallet')

  if (!fs.existsSync(walletAppFolder)) {
    fs.mkdirSync(walletAppFolder)
  }
}

const getWindowSize = (isGetStartedComplete: boolean = false) => {
  if (isGetStartedComplete || !config.get('getStartedInProgress', true)) {
    const width = 1130
    const height = 750

    return {
      width,
      height, 
      minWidth: width,
      minHeight: height,
      resizable: true,
    }
  }

  const width = 650
  const height = 700

  return {
    width,
    height,
    minWidth: width,
    minHeight: height,
    resizable: false
  }

}

global.childProcesses = getChildProcessesGlobal()

// Propagate Cloak node config for the RPC service
global.cloakNodeConfig = cloak.checkAndCreateConfig()

checkAndCreateWalletAppFolder()

// Uncomment this line to make the app working in Parallels Desktop
// app.disableHardwareAcceleration()

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Closing main application window just hides it on Macs
  if (getOS() !== 'macos') {
    app.quit()
  }
})

app.on('ready', async () => {
  app.on('activate', () => {
    if (getOS() === 'macos') {
      mainWindow.show()
    }
  })

  app.on('before-quit', event => {
    isExiting = true

    // Closing a window just hides it on Macs
    if (getOS() === 'macos' && getIsExitForbidden(mainWindow)) {
      event.preventDefault()
      return
    }

    log.info(`Killing all child processes...`)
    stopChildProcesses()
    log.info(`Done`)
  })

  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions()
  }

  let iconFileName = 'icon.png'
  if (getOS() === 'macos') {
    iconFileName = 'icon.icns'
  } else if (getOS() === 'windows') {
    iconFileName = 'icon.ico'
  }

  mainWindow = new BrowserWindow({
    ...getWindowSize(),
    show: false,
    frame: false,
    backgroundColor: '#1d2440',
    icon: path.join(getInstallationPath(), 'resources', `${iconFileName}`),
    webPreferences: {
      nodeIntegration: true
    }
  })

  const menuBuilder = new MenuBuilder(mainWindow)

  i18n.on('loaded', () => {
    i18n.changeLanguage(config.get('language', 'en'))
    i18n.off('loaded')
  })

  i18n.on('languageChanged', () => {
    menuBuilder.buildMenu()
  })

  ipcMain.on('change-language', (event, code) => {
    i18n.changeLanguage(code)
  })

  global.isParametersPresenceConfirmed = await fetchLdb.checkPresence({calculateChecksums: false})

  ipcMain.on('fetch-ldb', async () => {
    await fetchLdb.fetch(mainWindow)
  })

  // eslint-disable-next-line
  mainWindow.eval = global.eval = function () {
    throw new Error(`Sorry, this app does not support window.eval().`)
  }

  mainWindow.loadURL(`file://${__dirname}/app.html`)

  // Uncomment for debugging in prod mode
  mainWindow.webContents.openDevTools({detached: true});

  // Showing the window if DOM finished loading and the content has been rendered

  let isReadyToShow = false
  let isDomFinishedLoading = false

  const showMainWindow = () => {
      mainWindow.show()
      mainWindow.focus()
  }

  mainWindow.once('ready-to-show', () => {
    isReadyToShow = true
    if (isDomFinishedLoading) {
      showMainWindow()
    }
  })

  mainWindow.webContents.on('did-finish-load', () => {
    isDomFinishedLoading = true
    if (isReadyToShow) {
      showMainWindow()
    }
  })

  ipcMain.on('resize', () => {
    const windowSize = getWindowSize(true)
    mainWindow.setResizable(windowSize.resizable)
    mainWindow.setMinimumSize(windowSize.minWidth, windowSize.minHeight)
    mainWindow.setSize(windowSize.width, windowSize.height)
  })

  mainWindow.on('close', event => {
    if (getOS() === 'macos') {

      if (!isExiting) {
        event.preventDefault()
        mainWindow.hide()
      }

    } else if (getIsExitForbidden(mainWindow)) {
      event.preventDefault()
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

})
