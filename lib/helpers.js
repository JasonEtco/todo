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
