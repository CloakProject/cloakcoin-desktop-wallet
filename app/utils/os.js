import * as fs from 'fs'
import ps from 'ps-node'
import path from 'path'
import log from 'electron-log'
import { app, dialog, remote } from 'electron'

import { translate } from '../i18next.config'


const childProcessNames = ['NODE']


function getIsExitForbidden(mainWindow) {
  const t = translate('other')
  const { orders, operations } = global.pendingActivities

  if (orders || operations) {
    const isExitForbidden = dialog.showMessageBox(mainWindow, {
      type: 'question',
      buttons: [t(`Quit`), t(`Cancel`)],
      title: t(`Are you sure?`),
      message: t(`Pending activities are present, closing the application now can cause irreversible damage.`)
    })

    return isExitForbidden
  }

  return false
}

/**
 * Returns Cloak export dir as provided with -exportdir command line argument to the node.
 *
 */
function getExportDir() {
  return path.join(getAppDataPath(), 'ExportDir')
}

/**
 * Create a global and Store child processes information for the cleanup
 *
 */
function getChildProcessesGlobal() {
  const childProcesses = {}

  childProcessNames.forEach(processName => {
    childProcesses[processName] = {
      pid: null,
      instance: null,
      isGettingKilled: false
    }
  })

  return childProcesses
}

/**
 *
 * @memberof ChildProcessService
 */
function stopChildProcesses() {
  Object.entries(global.childProcesses).forEach(([processName, item]) => {
    if (item.instance !== null && !item.instance.killed) {
      global.childProcesses[processName].isGettingKilled = true

      log.info(`Killing child process ${processName} with PID ${item.instance.pid}`)

      // childProcess.kill() doesn't work for an unknown reason
      if (item.pid) {
        ps.kill(item.pid)
      } else {
        ps.kill(item.instance.pid)
      }
    }
  })
}

/**
 * Moves a file from one path to another, supports cross partitions and virtual file systems.
 *
 * @param {string} fromPath
 * @param {string} toPath
 * @returns {Promise<any>}
 */
function moveFile(fromPath, toPath) {
  const readStream = fs.createReadStream(fromPath)
  const writeStream = fs.createWriteStream(toPath)

  const promise = new Promise((resolve, reject) => {
    readStream.on('error', err => reject(err))
    writeStream.on('error', err => reject(err))

    readStream.on('close', () => {
      fs.unlink(fromPath, unlinkError => unlinkError ? reject(unlinkError) : resolve())
    });

    readStream.pipe(writeStream)
  })

  return promise
}


/**
 * Checks if a directory exists, otherwise creates one.
 *
 * @returns {Promise}
 */
function verifyDirectoryExistence(directoryPath: string) {
  const promise = new Promise((resolve, reject) => {
    fs.access(directoryPath, err => {
      if (err) {
        fs.mkdir(directoryPath, mkdirError => mkdirError ? reject(mkdirError) : resolve(directoryPath))
      }
      resolve(directoryPath)
    })
  })

  return promise
}

/**
 * Returns correct resource path for both development and production environments.
 *
 * @returns {string}
 */
function getResourcesPath() {
  let resourcesPath

  if (/[\\/](Electron\.app|Electron|Electron\.exe)[\\/]/i.test(process.execPath)) {
    resourcesPath = process.cwd()
  } else {
    ({ resourcesPath } = process)
  }

  return resourcesPath
}

/**
 */
function getAppDataPath() {
  const validApp = process.type === 'renderer' ? remote.app : app
  return path.join(validApp.getPath('appData'), 'CloakWallet')
}

/**
 * @returns {string}
 */
function getBinariesPath() {
  const resourcesPath = getResourcesPath()
  return path.join(resourcesPath, 'bin', getOS())
}


/**
 * Returns application install path.
 *
 * @returns {string}
 */
function getInstallationPath() {
  const validApp = process.type === 'renderer' ? remote.app : app
  let walkUpPath

  switch (getOS()) {
    case 'windows':
      walkUpPath = '/../../../'
    break
    case 'macos':
      walkUpPath = '/../../../../'
    break
    default:
      walkUpPath = '/../../../../..'
    break
  }

  log.info(validApp.getAppPath())

  return path.join(validApp.getAppPath(), walkUpPath)
}

/**
 * Returns a common name/alias for each OS family
 *
 * @returns {string}
 */
function getOS() {
  let os = 'linux'
  if (process.platform === 'darwin') {
    os = 'macos'
  } else if (process.platform === 'win32') {
    os = 'windows'
  }
  return os
}

export {
  getIsExitForbidden,
  getExportDir,
  getChildProcessesGlobal,
  stopChildProcesses,
  getAppDataPath,
  getBinariesPath,
  getInstallationPath,
  getOS,
  getResourcesPath,
  moveFile,
  verifyDirectoryExistence,
}
