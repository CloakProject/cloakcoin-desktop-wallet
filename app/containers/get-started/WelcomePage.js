// @flow
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import { translate } from 'react-i18next'

import { GetStartedActions } from '~/reducers/get-started/get-started.reducer'
import { Welcome } from '~/components/get-started/Welcome'

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(GetStartedActions.welcome, dispatch)
})

export default connect(state => state, mapDispatchToProps)(translate('get-started')(Welcome))
