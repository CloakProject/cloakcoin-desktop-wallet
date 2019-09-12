import { remote } from 'electron'
import config from 'electron-settings'
import { Decimal } from 'decimal.js'

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
    createNewWallet: {
      wallet: null
    },
    welcome: {
      hint: null,
      status: null,
      isBootstrapping: false,
      isReadyToUse: false
    },
    isCreatingNewWallet: true,
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
		daemonInfo: {},
		blockchainInfo: {
			version: '',
			protocolVersion: 0,
			walletVersion: 0,
			balance: Decimal('0'),
			unconfirmedBalance: Decimal('0'),
			immatureBalance: Decimal('0'),
			cloakingEarnings: Decimal('0'),
			newMint: Decimal('0'),
			stake: Decimal('0'),
			blocks: 0,
			moneySupply: Decimal('0'),
			connections: 0,
			proxy: '',
			ip: '',
			difficulty: Decimal('0'),
			keypoolOldest: 0,
			keypoolSize: 0,
			payTxFee: Decimal('0'),
			errors: '',
			anons: 0,
			cloakings: 0,
			weight: 0,
			networkWeight: 0,
			unlockedUntil: null,
			blockchainSynchronizedPercentage: 0,
			lastBlockDate: null
		}
	},
	overview: {
		balances: {
			balance: Decimal('0'),
			unconfirmedBalance: Decimal('0'),
			enigmaBalance: Decimal('0'),
			enigmaUnconfirmedBalance: Decimal('0'),
			totalBalance: Decimal('0'),
			totalUnconfirmedBalance: Decimal('0')
		},
		transactions: [],
		transactionDetails: {}
	},
	ownAddresses: {
		addresses: [],
		showDropdownMenu: false,
    frozenAddresses: {}
	},
	sendCash: {
		isEnigmaTransactions: false,
		lockIcon: 'Unlock',
		lockTips: null,
		fromAddress: '',
		toAddress: '',
		inputTooltips: '',
		amount: Decimal('0'),
		currentOperation: null,
		showDropdownMenu: false,
		sendFromRadioButtonType: 'transparent',
		addressList: [],
		receiptions: [],
		transactionId: '',
    isInputDisabled: false
	},
	addressBook: {
		records: [],
    newAddressModal: {
      defaultValues: {},
      isVisible: false
    }
	},
	settings: {
		isStatusModalOpen: false,
		childProcessesStatus: {
			NODE: 'NOT RUNNING',
    },
    language: 'en',
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

Object.assign(preloadedState.settings, {
	language: config.get('language', 'en')
})
