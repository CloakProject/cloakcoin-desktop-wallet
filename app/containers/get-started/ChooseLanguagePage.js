// @flow
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { ChooseLanguage } from '~/components/get-started/ChooseLanguage'
import { GetStartedActions } from '~/reducers/get-started/get-started.reducer'
import { translate } from 'react-i18next'

const mapStateToProps = state => ({
  getStarted: state.getStarted
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(GetStartedActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('get-started')(ChooseLanguage))

