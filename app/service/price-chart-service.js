// @flow
import log from 'electron-log'
import { Decimal } from 'decimal.js'

/**
 * ES6 singleton
 */
let instance = null

/**
 * @export
 * @class RpcService
 */
export class PriceChartService {
  /**
   * Creates an instance of PriceChartService.
   *
   * @memberof PriceChartService
   */
  constructor() {
    if (!instance) {
      instance = this
    }

    return instance
  }

  /**
   * Gets cloak/usd price chart in day for last 210 days.
   *
   * @memberof PriceChartService
   */
  getPriceChart() {
    const days = 210
    return fetch(`https://api.coingecko.com/api/v3/coins/cloakcoin/market_chart?vs_currency=usd&days=${days}`)
      .then(response => response.json())
      .then(data => data.prices.map((p) => ({
        time: p[0],
        price: Decimal(p[1])
      })))
      .catch(error => {
        log.debug(`An error occurred while fetching price chart: ${error}`)
        return error.message
      })
  }

    /**
   * Gets latest cloak/btc price.
   *
   * @memberof PriceChartService
   */
  getLatestPrice() {
    const symbol = 'btc'
    return fetch(`https://api.coingecko.com/api/v3/simple/price?ids=cloakcoin&vs_currencies=${symbol}`)
      .then(response => response.json())
      .then(data => data.cloakcoin.btc)
      .catch(error => {
        log.debug(`An error occurred while fetching price in ${symbol}: ${error}`)
        return error.message
      })
  }
}
