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
			connectionCount: 0,
			blockchainSynchronizedPercentage: 0,
			lastBlockDate: null
		},
    operations: [],
    isNewOperationTriggered: false,
    isOperationsModalOpen: false
	},
	overview: {
		balances: {
			transparentBalance: Decimal('0'),
			transparentUnconfirmedBalance: Decimal('0'),
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
Object.assign(preloadedState.getStarted, {
	isInProgress: config.get('getStartedInProgress', true)
})

Object.assign(preloadedState.settings, {
	language: config.get('language', 'en')
})
