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

const stripAt = exports.stripAt = str => {
  if (str.startsWith('@')) return str.split('@')[1]
  return str
}

exports.assignFlow = ({ autoAssign }, author) => {
  if (autoAssign === true) {
    return { assignee: author }
  } else if (typeof autoAssign === 'string') {
    return { assignee: autoAssign }
  } else if (Array.isArray(autoAssign)) {
    return { assignees: autoAssign.map(n => stripAt(n)) }
  }
}
