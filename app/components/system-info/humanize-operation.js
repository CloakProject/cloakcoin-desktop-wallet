/**
 * Returns human readable name for the given operation.
 *
 */
export default function humanizeOperationName(t, operation) {
  switch (operation.method) {
    case 'z_sendmany':
        return t(`Send cash`)
    case 'z_mergetoaddress':
        return t(`Merge coins`)
    case 'z_shieldcoinbase':
        return t(`Merge all mined coins`)
    default:
  }
  return operation.method
}

