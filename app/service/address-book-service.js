// @flow
import config from 'electron-settings'
import { of, throwError } from 'rxjs'
import { AddressBookRecord } from '../reducers/address-book/address-book.reducer'

import { i18n } from '~/i18next.config'

const addressBookConfigKey = 'addressBook'

/**
 * ES6 singleton
 */
let instance = null


/**
 * @export
 * @class AddressBookService
 */
export class AddressBookService {
  t: any

	/**
	 * @memberof AddressBookService
	 */
	constructor() {
    if (!instance) {
      instance = this
      instance.addressBook = []
    }

    instance.t = i18n.getFixedT(null, 'service')

		return instance
	}

	/**
   * Returns all Address Book records.
   *
	 * @returns {Observable<AddressBookRecord[]>}
	 * @memberof AddressBookService
	 */
	loadAddressBook() {
    this.addressBook = config.get(addressBookConfigKey, [])
		return of(this.addressBook.slice(0))
	}

	/**
   * Adds an address record to the Address Book.
   *
	 * @param {AddressBookRecord} addressRecord
	 * @returns {Observable<AddressBookRecord[]>}
	 * @memberof AddressBookService
	 */
	addAddress(addressRecord: AddressBookRecord) {
    const validated = this::validateAddressRecord(addressRecord)
    const match = record => (
      record.name === validated.name || record.address === validated.address
    )

    if (this.addressBook.filter(match).length) {
      return throwError(this.t(`Address already exists in the database.`))
    }

    this.addressBook.push(validated)
		config.set(addressBookConfigKey, this.addressBook)

    return of(this.addressBook.slice(0))
	}

	/**
   * Removes and address from the Address Book.
   *
	 * @param {string} name
	 * @returns {Observable<AddressBookRecord[]>}
	 * @memberof AddressBookService
	 */
	removeAddress(name: string) {
    const index = this.addressBook.findIndex(record => record.name === name)

    if (index === -1) {
      return throwError(this.t(`Address not found in the database.`))
    }

    this.addressBook.splice(index, 1)
		config.set(addressBookConfigKey, this.addressBook)

    return of(this.addressBook.slice(0))
	}

	/**
   * Updates an address record with new values.
   *
	 * @param {string]} originalName
	 * @param {AddressBookRecord} newAddressRecord
	 * @returns {Observable<AddressBookRecord[]>}
	 * @memberof AddressBookService
	 */
	updateAddress(originalName: string, newAddressRecord: AddressBookRecord) {
    const validated = this::validateAddressRecord(newAddressRecord)

    const index = this.addressBook.findIndex(record => record.name === originalName)

    if (index === -1) {
      return throwError(this.t(`Address not found in the database.`))
    }

    this.addressBook[index] = validated
		config.set(addressBookConfigKey, this.addressBook)

    return of(this.addressBook.slice(0))
	}
}

/**
 * Private method. Performs address record validation.
 *
 * @param {AddressBookRecord} addressRecord
 * @returns {AddressBookRecord}
 * @memberof AddressBookService
 */
function validateAddressRecord(addressRecord: AddressBookRecord) {
  // TODO: replace with proper form validation #116
  return addressRecord
}
