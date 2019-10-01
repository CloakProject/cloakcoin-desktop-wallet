// @flow
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { translate } from 'react-i18next'

import { AddressBookActions } from '../reducers/address-book/address-book.reducer'
import { PopupMenuActions } from '../reducers/popup-menu/popup-menu.reducer'
import { AddressBook } from '../components/address-book/AddressBook'

const mapStateToProps = state => ({
	addressBook: state.addressBook
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(AddressBookActions, dispatch),
  newAddressModalActions: bindActionCreators(AddressBookActions.newAddressModal, dispatch),
  popupMenu: bindActionCreators(PopupMenuActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('address-book')(AddressBook))
