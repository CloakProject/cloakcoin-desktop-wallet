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
import url from 'url'
import config from 'electron-settings'
import { app, ipcMain, BrowserWindow, globalShortcut } from 'electron'
import log from 'electron-log'
import AutoLaunch from 'auto-launch'

import { i18n } from './i18next.config'
import { getOS, getIsExitForbidden, getAppDataPath, getResourcesPath, getChildProcessesGlobal, stopChildProcesses } from './utils/os'
import { CloakService } from './service/cloak-service-main'
import { FetchLdbService } from './service/fetch-ldb-service'
// import MenuBuilder from './menu'


let isAbleToQuit = false
let isInitializing = true

// For the module to be imported in main, dirty, remove
const cloak = new CloakService()
const fetchLdb = new FetchLdbService()

const appDataPath = getAppDataPath()

if (!fs.existsSync(appDataPath)) {
  fs.mkdirSync(appDataPath)
}

log.transports.file.maxSize = 5 * 1024 * 1024
log.transports.file.file = path.join(appDataPath, 'cloakwallet.log')

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

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  const options = config.get('options', {})
  config.set('newOptions', options)

  /**
   * Add event listeners...
   */
   app.on('second-instance', () => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (!mainWindow.isVisible()) mainWindow.show()
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })

  app.on('window-all-closed', () => app.quit())

  app.on('ready', async () => {
    app.on('activate', () => {
      if (getOS() === 'macos' && mainWindow) {
        mainWindow.show()
      }
    })

    app.on('before-quit', event => {
      // Closing a window just hides it on Macs
      if (getOS() === 'macos' && getIsExitForbidden(mainWindow)) {
        event.preventDefault()
        return
      }

      log.info(`Killing all child processes...`)
      stopChildProcesses()
      log.info(`Done`)
    })

    globalShortcut.register('F11', () => {
      if (!isInitializing && mainWindow) {
        mainWindow.setFullScreen(!mainWindow.isFullScreen())
      }
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
      icon: path.join(getResourcesPath(), 'resources', `${iconFileName}`),
      webPreferences: { nodeIntegration: true, contextIsolation: false, enableRemoteModule: true }
    })

    mainWindow.setMenu(null)

    // const menuBuilder = new MenuBuilder(mainWindow)

    i18n.on('loaded', () => {
      const language = config.get('options.language', 'default')
      i18n.changeLanguage(language === 'default' ? 'en' : language)
      i18n.off('loaded')
    })

    // i18n.on('languageChanged', () => {
    //   menuBuilder.buildMenu()
    // })

    ipcMain.on('change-language', (event, code) => {
      i18n.changeLanguage(code)
    })

    ipcMain.on('change-startup', (event, isStartup) => {
      const execPath = process.argv[0]
      
      log.info(`Running process info:`, process.argv)
      log.info(`Registering startup:`, execPath)
      
      const appStartup = new AutoLaunch({
        name: 'CloakWallet',
        path: execPath,
      })

      appStartup.isEnabled()
        .then(isEnabled => {
            if (isEnabled === isStartup) {
              log.warn(isEnabled ? `Already registered as startup` : `Not registered as startup`)
              return Promise.resolve()
            }
            return isStartup ? appStartup.enable() : appStartup.disable()
        })
        .then(() => Promise.resolve())
        .catch(err => {
          log.debug(`Error registering as startup: ${err}`)
        })
    })

    ipcMain.on('use-app', async () => {
      isInitializing = false
    })

    ipcMain.on('force-quit', async () => {
      isAbleToQuit = true
      mainWindow.close()
    })

    global.isParametersPresenceConfirmed = await fetchLdb.checkPresence({calculateChecksums: false})

    ipcMain.on('fetch-ldb', async () => {
      await fetchLdb.fetch(mainWindow)
    })

    ipcMain.on('able-to-quit', async () => {
      isAbleToQuit = true
    })

    // eslint-disable-next-line
    mainWindow.eval = global.eval = function () {
      throw new Error(`Sorry, this app does not support window.eval().`)
    }

    // TODO: not loading the URL properly -- FIX!!!
    /* mainWindow.loadURL(`file://${__dirname}/app.html`) */

    mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'app.html'),
      protocol: 'file:',
      slashes: true
    }));

    // Uncomment for debugging in prod mode
    // mainWindow.webContents.openDevTools({detached: true});

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

    mainWindow.webContents.on('enter-full-screen', event => {
      if (isInitializing) {
        event.preventDefault()
      }
    })

    mainWindow.webContents.on('enter-html-full-screen', event => {
      if (isInitializing) {
        event.preventDefault()
      }
    })

    ipcMain.on('resize', () => {
      const windowSize = getWindowSize(true)
      mainWindow.setResizable(windowSize.resizable)
      mainWindow.setMinimumSize(windowSize.minWidth, windowSize.minHeight)
      mainWindow.setSize(windowSize.width, windowSize.height)
    })

    mainWindow.on('close', event => {
      if (isInitializing && !isAbleToQuit) {
        event.preventDefault()
        return
      }

      if (isInitializing && isAbleToQuit) {
        return
      }

      if (getIsExitForbidden(mainWindow)) {
        event.preventDefault()
      }

      const closeToTray = config.get('options.closeToTray', false)

      if (closeToTray && !isAbleToQuit) {
        event.preventDefault()
        mainWindow.hide()
      }
    })

    mainWindow.on('closed', () => {
      mainWindow = null
    })

  })
}