import { remote } from 'electron'
import config from 'electron-settings'
import { Decimal } from 'decimal.js'
import { i18n, translate } from '~/i18next.config'

const tDebug = translate('debug')

export const preloadedState: State = {
  auth: {
    reason: null,
    enter: true,
    isLoginRequired: true,
  },
	roundedForm: {},
	fetchLdb: {
    progressRate: 0,
    startedAt: null,
    minutesLeft: null,
    statusMessage: '',
    errorMessage: null,
    isDownloadComplete: false,
  },
  getStarted: {
    isInProgress: true
  },
  rpcPolling: {
    registeredActions: [],
    actionsResponseReceived: {}
  },
  popupMenu: {},
	navi: {
		currentNaviPath: '/overview'
	},
	systemInfo: {
		blockchainInfo: {
			version: 'N/A',
			protocolVersion: 0,
			walletVersion: 0,
			openSslVersion: 'N/A',
			clientName: 'N/A',
			clientBuiltDate: 'N/A',
			clientStartupTime: null,
			balance: Decimal('0'),
			unconfirmedBalance: Decimal('0'),
			immatureBalance: Decimal('0'),
			cloakingEarnings: Decimal('0'),
			newMint: Decimal('0'),
			stake: Decimal('0'),
			blocks: 0,
			highstBlock: 0,
			lastBlockTime: null,
			moneySupply: Decimal('0'),
			connections: 0,
			proxy: '',
			ip: '',
			difficulty: Decimal('0'),
			testnet: false,
			keypoolOldest: 0,
			keypoolSize: 0,
			payTxFee: Decimal('0'),
			errors: '',
			enigma: false,
			anons: 0,
			cloakings: 0,
			weight: 0,
			networkWeight: 0,
			unlockedUntil: null,
			unlockedMintOnly: false,
			blockchainSynchronizedPercentage: 0,
			lastBlockTime: null,
			mintEstimation: 0
		}
	},
	overview: {
		transactions: [],
		prices: [],
		price: null
	},
	ownAddresses: {
		addresses: [],
		showDropdownMenu: false,
    frozenAddresses: {}
	},
	sendCash: {
		receptionUnits: [],
		transactionId: '',
		isEnigmaSend: false,
		enigmaSendCloakers: 5,
		enigmaSendTimeout: 180,
    isSendingCash: false
	},
	addressBook: {
		records: [],
		sortedHeader: 'label',
		isDescending: false,
    newAddressModal: {
      defaultValues: {},
      isVisible: false
    }
	},
	enigmaStats: {
		cloakingInfo: {
			accepted: 0,
			signed: 0,
			refused: 0,
			expired: 0,
			completed: 0,
			earning: Decimal(0)
		},
		cloakingRequests: [],
		sortedHeader: '',
		isDescending: false
	},
	settings: {
		childProcessesStatus: {
			NODE: 'NOT RUNNING',
    }
  },
	options: {
		isOptionsOpen: false,
		isApplyingOptions: false,
		startupAtSystemLogin: false,
		detachDatabaseAtShutdown: false, // detachdb
		mapPortUsingUpnp: false, // upnp
		connectThroughSocksProxy: false, // proxy/ip:port
		proxyIp: '127.0.0.1',
		proxyPort: 9050,
		socksVersion: 'v5', // socks
		minimizeToTray: false,
		closeToTray: false,
		language: 'default',
		amountUnit: 'cloak',
		enigmaReserveBalance: 50, // enigmareserve
		enigmaAutoRetry: true, // enableenigmaretry
		cloakShieldEnigmaTransactions: true, // onionroute
		cloakShieldNonEnigmaTransactions: false, // onionrouteall
		cloakShieldRoutes: 3, // cloakshieldroutes
		cloakShieldNodes: 3, // cloakshieldnodes
		cloakShieldHops: 3 // cloakshieldhops
	},
	debug: {
		isDebugOpen: false,
		commandHistory: [{
			time: new Date(),
			command: false,
			response: tDebug(`Welcome to the CloakCoin RPC console.\nUse up and down arrows to navigate history, and Ctrl-L to clear screen.\nType help for an overview of available commands.`)
		}],
		historyPos: null
	},
	about: {
		isAboutOpen: false
	}
}

// Load serialized settings
Object.assign(preloadedState.fetchLdb, {
  isDownloadComplete: remote.getGlobal('isParametersPresenceConfirmed', false)
})

// Load serialized settings
Object.assign(preloadedState.getStarted, {
	isInProgress: config.get('getStartedInProgress', true)
})

Object.assign(preloadedState.options, {
	startupAtSystemLogin: config.get('options.startupAtSystemLogin', preloadedState.options.startupAtSystemLogin),
	detachDatabaseAtShutdown: config.get('options.detachDatabaseAtShutdown', preloadedState.options.detachDatabaseAtShutdown),
	mapPortUsingUpnp: config.get('options.mapPortUsingUpnp', preloadedState.options.mapPortUsingUpnp),
	connectThroughSocksProxy: config.get('options.connectThroughSocksProxy', preloadedState.options.connectThroughSocksProxy),
	proxyIp: config.get('options.proxyIp', preloadedState.options.proxyIp),
	proxyPort: config.get('options.proxyPort', preloadedState.options.proxyPort),
	socksVersion: config.get('options.socksVersion', preloadedState.options.socksVersion),
	minimizeToTray: config.get('options.minimizeToTray', preloadedState.options.minimizeToTray),
	closeToTray: config.get('options.closeToTray', preloadedState.options.closeToTray),
	language: config.get('options.language', preloadedState.options.language),
	amountUnit: config.get('options.amountUnit', preloadedState.options.amountUnit),
	enigmaReserveBalance: config.get('options.enigmaReserveBalance', preloadedState.options.enigmaReserveBalance),
	enigmaAutoRetry: config.get('options.enigmaAutoRetry', preloadedState.options.enigmaAutoRetry),
	cloakShieldEnigmaTransactions: config.get('options.cloakShieldEnigmaTransactions', preloadedState.options.cloakShieldEnigmaTransactions),
	cloakShieldNonEnigmaTransactions: config.get('options.cloakShieldNonEnigmaTransactions', preloadedState.options.cloakShieldNonEnigmaTransactions),
	cloakShieldRoutes: config.get('options.cloakShieldRoutes', preloadedState.options.cloakShieldRoutes),
	cloakShieldNodes: config.get('options.cloakShieldNodes', preloadedState.options.cloakShieldNodes),
	cloakShieldHops: config.get('options.cloakShieldHops', preloadedState.options.cloakShieldHops),
})
