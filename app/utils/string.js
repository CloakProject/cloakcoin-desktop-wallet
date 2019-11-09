
function ellipsisString(str, n, side) {
  if (str.length <= n) {
    return str
  }
  if (side === 'left') {
    return `...${str.substr(str.length - n)}`
  }
  if (side === 'middle') {
    return `${str.substr(0, n / 2)}...${str.substr(str.length - n / 2)}`
  }
  return `${str.substr(0, n)}...`
}

export {
  ellipsisString
}
