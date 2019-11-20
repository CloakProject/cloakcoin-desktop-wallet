import { Decimal } from 'decimal.js'
// import { DECIMAL } from '~/constants/decimal'

function truncateAmount(amount: Decimal, places: number = 2) {
  return amount.toFixed(places);
}

function toDecimalPlaces(amount: Decimal, places: number = 4) {
  return amount.toDP(places, Decimal.ROUND_FLOOR).toString()
}

function flattenDecimals(object) {
  const result = {}

  Object.keys(object).forEach(key => {
    const value = object[key]

    result[key] = typeof value === typeof Decimal(0)
      ? Number(value.toString())
      : value
  })

  return result
}

export {
  truncateAmount,
  toDecimalPlaces,
  flattenDecimals
}
