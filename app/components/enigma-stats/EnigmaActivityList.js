/* eslint-disable import/no-unresolved */
/* eslint-disable react/no-array-index-key */
/* eslint-disable no-unused-expressions */
// @flow
// import moment from 'moment'
import React, { Component } from 'react'
import { translate } from 'react-i18next'
import cn from 'classnames'
import styles from './EnigmaActivityList.scss'
import dropdownImg from '~/assets/images/main/enigmastats/dropdown.png';

const mockData = [
  {
    type: 'Reward',
    date: "19.7.2019 19:05",
    total: 0.37684,
    participants: 12,
    acquired: 6,
    signed: 236,
    status: 'Ok'
  },
  {
    type: 'Send',
    date: "19.7.2019 19:05",
    total: 0.37684,
    participants: 12,
    acquired: 6,
    signed: 236,
    status: 'Ok'
  },
  {
    type: 'Cloaking',
    date: "19.7.2019 19:05",
    total: 0.37684,
    participants: 12,
    acquired: 6,
    signed: 236,
    status: 'Pending'
  },
]

class EnigmaActivityList extends Component<Props> {
	props: Props

	render() {
    const { t } = this.props
    // {moment.unix(transaction.timestamp).locale(i18n.language).format('L kk:mm:ss')}
		return (
      <div className={cn(styles.enigmaActivityList)}>
        <div className={styles.tableHeader}>
          <div className={styles.typeField}>
            <span>{t('Type')}</span>
            <img src={dropdownImg} alt="sort" />
          </div>
          <div className={styles.dateField}>
            <span>{t('Initiated on')}</span>
            <img src={dropdownImg} alt="sort" />
          </div>
          <div className={styles.totalField}>
            <span>{t('Total')}</span>
            <img src={dropdownImg} alt="sort" />
          </div>
          <div className={styles.participantField}>
            <span>{t('Participants')}</span>
            <img src={dropdownImg} alt="sort" />
          </div>
          <div className={styles.acquiredField}>
            <span>{t('Acquired')}</span>
            <img src={dropdownImg} alt="sort" />
          </div>
          <div className={styles.signedField}>
            <span>{t('Signed')}</span>
            <img src={dropdownImg} alt="sort" />
          </div>
          <div className={styles.statusField}>
            <span>{t('Status')}</span>
            <img src={dropdownImg} alt="sort" />
          </div>
          <div className={styles.txIdField}>
            <span>{t('Tx id')}</span>
            <img src={dropdownImg} alt="sort" />
          </div>
        </div>
        <div className={styles.enigmaActivityListWrapper}>
          {
            mockData.map((enigmaData, index) => (
              <div className={styles.enigmaItem} key={index}>
                <div className={styles.typeField}>
                  <span>{enigmaData.type}</span>
                </div>
                <div className={styles.dateField}>
                  <span>{enigmaData.date}</span>
                </div>
                <div className={styles.totalField}>
                  <span>{enigmaData.total}</span>
                </div>
                <div className={styles.participantField}>
                  <span>{enigmaData.participants}</span>
                </div>
                <div className={styles.acquiredField}>
                  <span>{enigmaData.acquired}</span>
                </div>
                <div className={styles.signedField}>
                  <span>{enigmaData.signed}</span>
                </div>
                <div className={styles.statusField}>
                  <span>{enigmaData.status}</span>
                </div>
                <div className={styles.txIdField}>
                  <button	type="button">
                    {t(`See`)}
                  </button>
                </div>
              </div>
            ))
          }
        </div>
      </div>
		)
	}
}

export default translate('enigma-stats')(EnigmaActivityList)
