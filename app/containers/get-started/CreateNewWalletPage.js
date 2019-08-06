// @flow
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import { translate } from 'react-i18next'

import { GetStartedActions } from '~/reducers/get-started/get-started.reducer'
import { CreateNewWallet } from '~/components/get-started/CreateNewWallet'

const mapStateToProps = state => ({
	createNewWallet: state.getStarted.createNewWallet
})

const mapDispatchToProps = dispatch => ({
  getStartedActions: bindActionCreators(GetStartedActions, dispatch),
  actions: bindActionCreators(GetStartedActions.createNewWallet, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('get-started')(CreateNewWallet))
