// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import cn from 'classnames'
import { getStore } from '~/store/configureStore'
import { AddressBookActions, AddressBookState } from '~/reducers/address-book/address-book.reducer'
import { OwnAddressesActions } from '~/reducers/own-addresses/own-addresses.reducer'
import RoundedInput from '~/components/rounded-form/RoundedInput'

import styles from './NewAddressModal.scss'

type Props = {
	newAddressModal: AddressBookState.newAddressModal
}

let ownAddress = '';

/**
 * @class AddressModal
 * @extends {Component<Props>}
 */
class NewAddressModal extends Component<Props> {
  props: Props
  constructor(props) {
    super(props);
    this.state = {
      receiver: '',
      label: '',
      isExistAddress: false,
    }
  }

	componentWillMount() {
    this.props.actions.loadAddressBook()
	}

  handleReceiverChange = (value) => {
    this.setState({receiver: value});
	}

	handleLabelChange = (value) => {
    this.setState({label: value});
  }
  
  addNewAddress = () => {
    this.props.newAddressModal.defaultValues.name = this.state.label;
    this.props.newAddressModal.defaultValues.isEnigma = this.props.isEnigma;

    if (this.state.label.trim().length !== 0) {
      const record = this.props.addressBook.records.filter(item => item.name.toLowerCase() === this.state.label.toLowerCase());
      if (record.length !== 0 || this.state.label.toLowerCase() === 'cloaking') {
        this.setState({ isExistAddress: true });
        return;
      }
      this.setState({ isExistAddress: false });

      if (!this.props.isOwnAddress) {
        this.props.newAddressModal.defaultValues.address = this.state.receiver;
        getStore().dispatch(AddressBookActions.newAddressModal.addAddress());
      } else {
        this.props.own_actions.createAddress(this.props.isEnigma)
      }
      this.props.onClose();
    }
  }

  addOwnAddress = newAddress => {
    if (newAddress && this.props.isOwnAddress) {
      if (newAddress.address !== ownAddress) {
        ownAddress = newAddress.address;
        this.props.newAddressModal.defaultValues.isEnigma = this.props.isEnigma;
        this.props.newAddressModal.defaultValues.address = newAddress.address;
        getStore().dispatch(AddressBookActions.newAddressModal.addAddress());
      }
      return false;
    }
  }

	render() {
    const { isvisible, onClose } = this.props
    if (this.props.isOwnAddress) {
      this.addOwnAddress(this.props.ownAddresses.latestNewAdddress)
    }
    if (!isvisible) {
      return null
    }

		return (
      <div className={styles.overlay}>
        <div className={cn(styles.container, styles.newAddress)}>
          <div
            role="button"
            tabIndex={0}
            className={cn('icon', styles.modalClose)}
            onClick={onClose}
            onKeyDown={() => {}}
          />
          {
            !this.props.isOwnAddress &&
            <div className={styles.sendAddress}>
              <p>Address</p>
              <RoundedInput
                name="receiver"
                placeholder="Enter a valid CloakCoin or ENIGMA address"
                value={this.state.receiver}
                onChange={value => this.handleReceiverChange(value)}
              />
            </div>
          }
					<div className={styles.addressLabel}>
						<p>Label</p>
						<RoundedInput
							name="label"
							placeholder='Enter a label for this address to add it to your address book'
							value={this.state.label}
							onChange={value => this.handleLabelChange(value)}
						/>
					</div>
          {this.state.isExistAddress && <p className={styles.error}>Address already exists</p> }
          <button type="button" onClick={this.addNewAddress}>
            ADD
          </button>
        </div>
      </div>
		)
	}
}

const mapStateToProps = state => ({
  newAddressModal: state.addressBook.newAddressModal,
  addressBook: state.addressBook,
	ownAddresses: state.ownAddresses
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(AddressBookActions, dispatch),
  own_actions: bindActionCreators(OwnAddressesActions, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(NewAddressModal)
