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

const stripAt = str => {
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

exports.endDiff = diff => diff + '\n__END_OF_DIFF_PARSING__'

exports.lineBreak = body => {
  const regEx = /\/?&lt;br(?:\s\/)?&gt;/g // Regular expression to match all occurences of '&lt;br&gt'
  return body.replace(regEx, '<br>')
}
