// @flow
import { connect } from 'react-redux'
// import { bindActionCreators } from 'redux'
import { Simplex } from '~/components/simplex/Simplex'
import { translate } from 'react-i18next'

export default connect(null, null)(translate('other')(Simplex))
