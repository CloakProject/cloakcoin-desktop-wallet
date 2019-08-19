/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { translate } from 'react-i18next'
import EnigmaActivityList from '~/components/enigma-stats/EnigmaActivityList'
import styles from './enigma-stats.scss'
import HLayout from '~/assets/styles/h-box-layout.scss'
import VLayout from '~/assets/styles/v-box-layout.scss'
import enigmaImg from '~/assets/images/main/enigmastats/enigma.png';

type Props = {
  t: any
}

/**
 * @class EnigmaStats
 * @extends {Component<Props>}
 */
class EnigmaStats extends Component<Props> {
	props: Props
	/**
	 * @memberof EnigmaState
	 */

	render() {
		const { t } = this.props
		const mockData = [
			{ label: t('Requests accepted'), value: 12 },
			{ label: t('Requests refused'), value: 5 },
			{ label: t('Requests completed'), value: 7 },
			{ label: t('Requests signed'), value: 296 },
			{ label: t('Requests expired'), value: 37 },
			{ label: t('Fees received (CLOAK)'), value: 0.83425 },
		];

		return (
			<div className={[styles.enigmaStatsContainer, VLayout.vBoxChild, HLayout.hBoxContainer].join(' ')}>
				<div className={styles.enigmaStatsWrapper}>
					<div className={styles.leftSide}>
						<img src={enigmaImg} alt="img" />
						<p>{t('ENIGMA STATS')}</p>
						<p>{t('ENIGMA Cloaking')}</p>
					</div>
					<div className={styles.rightSide}>
						<div className={styles.enigmaInfo}>
							{
								mockData.map((item, index) => (
										<div className={index !== 5 ? styles.borderLine : ''} key={item.label}>
											<p>{item.label}</p>
											<p>{item.value}</p>
										</div>
									))
							}
						</div>
					</div>
				</div>
				<div className={styles.enigmaActivityListWrapper}>
					<p>{t('Enigma Send Activity')}</p>
          <EnigmaActivityList />
				</div>
			</div>
		)
	}
}

const mapStateToProps = state => ({
	enigmaState: state.enigmaStats
})

export default connect(mapStateToProps, null)(translate('enigma-stats')(EnigmaStats))
