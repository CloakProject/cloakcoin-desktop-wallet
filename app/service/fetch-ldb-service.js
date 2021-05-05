// @flow
import * as fs from 'fs-extra'
import path from 'path'
import { app, remote, ipcRenderer } from 'electron'
import log from 'electron-log'
import extract from 'extract-zip'

import { getOS } from '../utils/os'
import { translate } from '../i18next.config'

const t = translate('service')

const ldbFolderName = 'CloakCoin'
const ldbUrl = `https://backend.cloakcoin.com/wallet/v2`
// const ldbUrl = `https://file-examples.com/wp-content/uploads/2017/02`
const ldbFiles = [
  { name: 'cloak_ldb.zip', checksum: '' }
  // { name: 'zip_2MB.zip', checksum: '' }
]

/**
 * ES6 singleton
 */
let instance = null

/**
 * @export
 * @class FetchLdbService
 */
export class FetchLdbService {
  mainWindow = null
  downloadListener: () => void
  totalBytes: number
	completedBytes: number
  downloadItems: set

	/**
	 * Creates an instance of FetchLdbService.
	 * @memberof FetchLdbService
	 */
	constructor() {
    if (!instance) {
      instance = this
    }

		return instance
	}

  getLdbFolder(): string {
    const validApp = process.type === 'renderer' ? remote.app : app
    let ldbFolder = path.join(validApp.getPath('appData'), ldbFolderName)

    if (getOS() === 'linux') {
      ldbFolder = path.join(validApp.getPath('home'), '.CloakCoin')
    }

    return ldbFolder
  }

  getLdbServingFiles(): string {
    const ldbFolder = this.getLdbFolder()

    const ldbServingFiles = [
      path.join(ldbFolder, 'blk0001.dat'),
      path.join(ldbFolder, 'blk0002.dat'),
    ];
    return ldbServingFiles
  }

	/**
   * Returns true if Ldb files are present.
   *
	 * @memberof FetchLdbService
	 * @returns {boolean}
	 */
  async checkPresence() {
    const ldbFolder = this.getLdbFolder()

    log.info(`Checking for ldb directory ${ldbFolder}`)

    if (!fs.pathExistsSync(ldbFolder)) {
      log.info(`The ldb directory ${ldbFolder} does not exist`)
      return false
    }

    log.info(`The ldb directory ${ldbFolder} exists`)

    const ldbServingFiles = this.getLdbServingFiles()
    let hasError = false

    ldbServingFiles.forEach(ldbServingFile => {
      if (!fs.pathExistsSync(ldbServingFile)) {
        log.info(`The ldb file ${ldbServingFile} does not exist`)
        hasError = true
      }
    })

    if (hasError) {
      return false
    }

    return true
  }

  bindRendererHandlersAndFetch(dispatch, actions) {
    ipcRenderer.on('fetch-ldb-status', (event, message) => {
      dispatch(actions.status(message))
    })

    ipcRenderer.on('fetch-ldb-download-progress', (event, {receivedBytes, totalBytes}) => {
      dispatch(actions.downloadProgress(receivedBytes, totalBytes))
    })

    ipcRenderer.on('fetch-ldb-download-complete', () => {
      dispatch(actions.downloadComplete())
    })

    ipcRenderer.on('fetch-ldb-download-failed', (event, errorMessage) => {
      dispatch(actions.downloadFailed(errorMessage))
    })

    ipcRenderer.on('fetch-ldb-extract-failed', (event, errorMessage) => {
      dispatch(actions.extractFailed(errorMessage))
    })

    ipcRenderer.send('fetch-ldb')
  }

	/**
   * Downloads Ldb file
   *
	 * @memberof FetchLdbService
	 * @returns {boolean}
	 */
  async fetch(mainWindow) {
    this.mainWindow = mainWindow
    this.totalBytes = 0
		this.completedBytes = 0
    this.downloadItems = new Set()

    try {
      await this::fetchOrThrowError()
    } catch(err) {
      if (mainWindow.isDestroyed()) {
        log.error(`Fetching Ldb files aborted due to the main window destruction.`)
        log.error(err.toString())
      } else {
        mainWindow.webContents.send('fetch-ldb-download-failed', err.message)
      }
    }
  }

}

async function fetchOrThrowError() {
  this::status(t(`Checking Ldb files presence`))

  if (await this.checkPresence({calculateChecksums: true})) {
    this::downloadComplete()
    return
  }

  const ldbFolder = this.getLdbFolder()

  if (!fs.pathExistsSync(ldbFolder)) {
    fs.mkdirpSync(ldbFolder)
  }

  await this::downloadLdbFiles()

  this::downloadComplete()
}

function downloadDoneCallback(state, fileName, resolve, reject) {
  let error = null

  const removeListener = () => {
    if (!this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.session.removeListener('will-download', this.downloadListener)
      this.mainWindow.setProgressBar(-1)
    }
  }

  switch(state) {
    case 'cancelled':
      error = new Error(t(`The download of {{fileName}} has been cancelled`, { fileName }))
      break
    case 'interrupted':
      error = new Error(t(`The download of {{fileName}} was interruped`, { fileName }))
      break
    case 'completed':
      if (this.downloadItems.size === 0) {
        removeListener()
        resolve()
      }

      break
    default:
      log.error(`The download of ${fileName} finished with an unknown state ${state}`)
      error = new Error(t(`The download of {{fileName}} has failed, check the log for details`, { fileName }))
  }

  if (error !== null) {
    if (this.downloadItems.size === 0) {
      removeListener()
    }
    reject(error)
  }

}

function registerDownloadListener(resolve, reject) {
  this.downloadListener = (e, downloadItem) => {
    const savePath = path.join(this.getLdbFolder(), downloadItem.getFilename())
    const requiredExtract = savePath.toLowerCase().endsWith('.zip')

    downloadItem.setSavePath(savePath)

    this.downloadItems.add(downloadItem)
    this.totalBytes += downloadItem.getTotalBytes()
    if (requiredExtract) {
      this.totalBytes += downloadItem.getTotalBytes()
    }

    // It seems that Chrome doesn't perform error handling, came up with this check:
    if (downloadItem.getTotalBytes() === 0) {
      reject(Error(t(`No Internet`)))
    }

    downloadItem.on('updated', () => this::downloadUpdatedCallback())

    downloadItem.on('done', (event, state) => {
      const downloadedFileName = downloadItem.getFilename()

      this::downloadFinishedCallback(downloadItem)

      // Extract doenloaded zip file
      if (requiredExtract) {
        const ldbFolder = this.getLdbFolder()
        const destTmpPath = path.join(ldbFolder, 'ldbtemp')
        fs.removeSync(destTmpPath);

        extract(savePath,
          {
            dir: destTmpPath,
            onEntry: this::extractUpdatedCallback
          },
          (errExtract) => {
            try {
              if (errExtract) {
                throw errExtract
              }
  
              // Move extracted files to Ldb folder
              fs.moveSync(path.join(destTmpPath, 'txleveldb'), path.join(ldbFolder, 'txleveldb'), {overwrite: true})
              fs.moveSync(path.join(destTmpPath, 'blk0001.dat'), path.join(ldbFolder, 'blk0001.dat'), {overwrite: true})
              fs.moveSync(path.join(destTmpPath, 'blk0002.dat'), path.join(ldbFolder, 'blk0002.dat'), {overwrite: true})
              fs.moveSync(path.join(destTmpPath, 'peers.dat'), path.join(ldbFolder, 'peers.dat'), {overwrite: true})
              // fs.moveSync(path.join(destTmpPath, 'zip_10MB'), path.join(ldbFolder, 'zip_10MB'), {overwrite: true})
              
              // Remove tmp files
              fs.removeSync(destTmpPath)
              fs.removeSync(savePath)
  
              this::downloadDoneCallback(state, downloadedFileName, resolve, reject)
            } catch(err) {
              if (this.mainWindow.isDestroyed()) {
                log.error(`Ldb file ${savePath} extract failed.`)
                log.error(err.toString())
              } else {
                this.mainWindow.webContents.send('fetch-ldb-extract-failed', err.message)
              }
            }
          })
      } else {
        this::downloadDoneCallback(state, downloadedFileName, resolve, reject)
      }
     
    })

  }

  this.mainWindow.webContents.session.on('will-download', this.downloadListener)
}

function downloadUpdatedCallback() {
  const receivedBytes = [...this.downloadItems].reduce((bytesCounter, item) => (
    bytesCounter + item.getReceivedBytes()
  ), this.completedBytes)

  if (!this.mainWindow.isDestroyed()) {
    this.mainWindow.setProgressBar(receivedBytes === this.totalBytes ? 1 : receivedBytes / this.totalBytes)
    this.mainWindow.webContents.send('fetch-ldb-download-progress', {
      receivedBytes,
      totalBytes: this.totalBytes,
    })
  }
}

function downloadFinishedCallback(downloadItem) {
  this.downloadItems.delete(downloadItem)
  this.completedBytes += downloadItem.getTotalBytes()
}

function extractUpdatedCallback(entry) {
  this.completedBytes += entry.compressedSize

  this::downloadUpdatedCallback()
}

function downloadLdbFiles() {
  const downloadPromise = new Promise((resolve, reject) => {
    this::registerDownloadListener(resolve, reject)

    ldbFiles.forEach(({name: fileName}) => {
      const filePath = path.join(this.getLdbFolder(), fileName)

      if (fs.pathExistsSync(filePath)) {
        fs.removeSync(filePath)
      }

      this.mainWindow.webContents.downloadURL(`${ldbUrl}/${fileName}`)
    })
  })

  return downloadPromise
}

/**
 * Private method. Informs renderer on download completion.
 *
 * @memberof FetchLdbService
 */
function downloadComplete() {
  if (!this.mainWindow.isDestroyed()) {
    log.info(`Ldb files download completed`)
    this.mainWindow.webContents.send('fetch-ldb-download-complete')
  }
}

/**
 * Private method. Reports the download status to the renderer.
 *
 * @memberof FetchLdbService
 */
function status(message: string) {
  if (!this.mainWindow.isDestroyed()) {
    this.mainWindow.webContents.send('fetch-ldb-status', message)
  }
}
