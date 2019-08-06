// @flow
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import { translate } from 'react-i18next'

import { GetStartedActions } from '~/reducers/get-started/get-started.reducer'
import { GetStarted } from '~/components/get-started/GetStarted'

const mapStateToProps = state => ({
	getStarted: state.getStarted
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(GetStartedActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('get-started')(GetStarted))
