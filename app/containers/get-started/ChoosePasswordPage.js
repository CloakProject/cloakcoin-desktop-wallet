// @flow
import { connect } from 'react-redux'
import { ChoosePassword } from '~/components/get-started/ChoosePassword'
import { translate } from 'react-i18next'

const mapStateToProps = state => ({
  getStarted: state.getStarted,
  form: state.roundedForm.getStartedChoosePassword
})

export default connect(mapStateToProps, null)(translate('get-started')(ChoosePassword))

