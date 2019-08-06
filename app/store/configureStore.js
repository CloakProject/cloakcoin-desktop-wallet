// @flow
if (process.env.NODE_ENV === 'production') {
	module.exports = require('./configureStore.prod') // eslint-disable-line global-require
} else {
	module.exports = require('./configureStore.dev') // eslint-disable-line global-require
}

// Allows module import when the store is not yet initialized
export const getStore = () => module.exports.appStore
module.exports.getStore = getStore
