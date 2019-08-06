// @flow
import * as Joi from 'joi'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { translate } from 'react-i18next'
import cn from 'classnames'

import ValidateAddressService from '~/service/validate-address-service'
import {
  RoundedForm,
  RoundedInput,
  RoundedInputWithPaste,
  RoundedButton
} from '~/components/rounded-form'
import { AddressBookActions, AddressBookState } from '~/reducers/address-book/address-book.reducer'

import styles from './NewAddressModal.scss'


const validateAddress = new ValidateAddressService()

const getValidationSchema = t => Joi.object().keys({
  name: Joi.string().required().label(t(`Name`)),
  address: (
    validateAddress.getJoi()
    .cloakAddress()
    .rZ().rLength().zLength().valid()
    .required().label(t(`Address`))
  )
})

type Props = {
  t: any,
  actions: object,
  newAddressModal: AddressBookState.newAddressModal
}

/**
 * @class AddressModal
 * @extends {Component<Props>}
 */
class NewAddressModal extends Component<Props> {
	props: Props

	render() {
    const { t } = this.props

    if (!this.props.newAddressModal.isVisible) {
      return null
    }

		return (
      <div className={styles.overlay}>
        <div className={cn(styles.container, styles.newAddress)}>

          <div
            role="button"
            tabIndex={0}
            className={cn('icon', styles.closeButton)}
            onClick={this.props.actions.close}
            onKeyDown={() => {}}
          />

          {/* Title */}
          <div className={styles.title}>
            { this.props.newAddressModal.isInEditMode
              ? t(`Edit address`)
              : t(`New address`) }
          </div>

          <RoundedForm
            id="addressBookNewAddressModal"
            schema={getValidationSchema(t)}
          >
            {/* Name */}
            <RoundedInput
              name="name"
              labelClassName={styles.inputLabel}
              defaultValue={this.props.newAddressModal.defaultValues.name}
              label={t(`Name`)}
            />

            {/* Address */}
            <RoundedInputWithPaste
              name="address"
              labelClassName={styles.inputLabel}
              defaultValue={this.props.newAddressModal.defaultValues.address}
              label="Address"
            />

            { /* Buttons */}
            <div className={styles.buttonContainer}>
              <RoundedButton
                type="submit"
                className={styles.button}
                onClick={
                  this.props.newAddressModal.isInEditMode
                    ? this.props.actions.updateAddress
                    : this.props.actions.addAddress
                }
                important
              >
                { this.props.newAddressModal.isInEditMode ? t(`Edit`) : t(`Add`) }
              </RoundedButton>

              <RoundedButton
                className={styles.button}
                onClick={this.props.actions.close}
              >
                {t(`Cancel`)}
              </RoundedButton>

            </div>
          </RoundedForm>
        </div>
      </div>
		)
	}
}

const mapStateToProps = (state) => ({
	newAddressModal: state.addressBook.newAddressModal
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(AddressBookActions.newAddressModal, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('address-book')(NewAddressModal))
