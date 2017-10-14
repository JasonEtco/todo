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

exports.addAt = str => {
  if (!str.startsWith('@')) return `@${str}`
  return str
}

exports.stripAt = str => {
  if (str.startsWith('@')) return str.split('@')[1]
  return str
}
