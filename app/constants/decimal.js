import { Decimal } from 'decimal.js'

const appTimeStarted = Date.now()

const DECIMAL = {
  appTimeStarted,
  fractionalDigitsNumber: 4,
  transactionFee: Decimal('0.0001')
}

export { appTimeStarted, DECIMAL }
