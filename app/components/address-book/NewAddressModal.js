// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { translate } from 'react-i18next'
import cn from 'classnames'
import * as Joi from 'joi'
import { AddressBookActions } from '~/reducers/address-book/address-book.reducer'
import {
  RoundedForm,
  RoundedButton,
  RoundedInput,
} from '~/components/rounded-form'

import styles from './NewAddressModal.scss'
import ValidateAddressService from '~/service/validate-address-service'

const validateAddress = new ValidateAddressService()

const getCloakValidationSchema = t => Joi.object().keys({
  address: (
    validateAddress.getJoi()
    .cloakAddress()
    .validCloak().label(t(`Address`))
  ),
  label: (
    validateAddress.getJoiWithAddressBook()
    .addressBook()
    .valid().label(t(`Label`))
  )
})

const getStealthValidationSchema = t => Joi.object().keys({
  address: (
    validateAddress.getJoi()
    .cloakAddress()
    .validStealth().label(t(`Address`))
  ),
  label: (
    validateAddress.getJoiWithAddressBook()
    .addressBook()
    .valid().label(t(`Label`))
  )
})

const getLabelOnlyValidationSchema = t => Joi.object().keys({
  address: (
    Joi.string().allow('', null)
  ),
  label: (
    validateAddress.getJoiWithAddressBook()
    .addressBook()
    .valid().label(t(`Label`))
  )
})

type Props = {
  t: any,
  isVisible: boolean,
  isStealth: boolean,
  isOwnAddress: boolean | undefined | null
}

/**
 * @class AddressModal
 * @extends {Component<Props>}
 */
class NewAddressModal extends Component<Props> {
  props: Props

  getValidationSchema() {
    const { t, isStealth, isOwnAddress } = this.props
    if (isOwnAddress) {
      return getLabelOnlyValidationSchema(t)
    }
    return isStealth ? getStealthValidationSchema(t) : getCloakValidationSchema(t)
  }

  addAddress() {
    const { isStealth, isOwnAddress } = this.props
    if (!isOwnAddress) {
      this.props.actions.addOrUpdateAddress()
    } else {
      this.props.actions.createAddress(isStealth)
    }
  }

	render() {
    const { t, isVisible, isStealth, isOwnAddress, onClose } = this.props

    if (!isVisible) {
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
          <RoundedForm
						id="addressBookNewAddressModal"
						schema={this.getValidationSchema()}
						options={{abortEarly: true}}
						defaultValues={{address: '', label: ''}}
					>

          {!isOwnAddress &&
            (<div className={styles.address}>
              <p>{t(`Address`)}</p>
              <RoundedInput
                name="address"
                placeholder={isStealth ? t('Enter a valid ENIGMA address') : t('Enter a valid Cloak address')}
                disabled={this.props.newAddressModal.isDoing}
              />
            </div>)}
					<div className={styles.addressLabel}>
						<p>{t(`Label`)}</p>
						<RoundedInput
							name="label"
              placeholder={isOwnAddress ?
                t('Enter a label for new address to add it to your address book') :
                t('Enter a label for this address to add it to your address book')}
              disabled={this.props.newAddressModal.isDoing}
            />
					</div>
          <RoundedButton
            type="submit"
            onClick={() => this.addAddress()}
            important
            spinner={this.props.newAddressModal.isDoing}
            disabled={this.props.newAddressModal.isDoing}
          >
            {t(`Add`)}
          </RoundedButton>
        </RoundedForm>
        </div>
      </div>
		)
	}
}

const mapStateToProps = state => ({
  newAddressModal: state.addressBook.newAddressModal
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(AddressBookActions.newAddressModal, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('service')(NewAddressModal))
