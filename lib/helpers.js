exports.reduceToList = array => {
  return array.reduce((prev, value, i) => {
    if (i + 1 === array.length) {
      return prev + ` and ${value}`
    } else if (i === 0) {
      return prev + `${value}`
    } else {
      return prev + `, ${value}`
    }
  }, '')
}

exports.truncate = (str, maxLength = 80) => {
  if (str.length < maxLength) return str
  return str.substring(0, maxLength) + '...'
}

exports.addAt = str => {
  if (!str.startsWith('@')) return `@${str}`
  return str
}
