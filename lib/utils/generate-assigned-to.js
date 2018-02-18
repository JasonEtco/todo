const {reduceToList, addAt} = require('./helpers')

/**
 * Generates the assigned-to part of the footer string
 * @param {boolean|string|string[]} [autoAssign=true] - Auto assign config setting
 * @param {string} author - Commit author
 * @param {number|boolean} author - PR number or false
 * @returns {string}
 */
module.exports = function generateAssignedTo (autoAssign, author, pr) {
  if (autoAssign === true) {
    return pr ? ` cc @${author}.` : ` It's been assigned to @${author} because they committed the code.`
  }

  if (autoAssign === false) {
    return ''
  }

  let assigner
  if (typeof autoAssign === 'string') {
    assigner = addAt(autoAssign)
  }

  if (Array.isArray(autoAssign)) {
    const assigners = autoAssign.map(user => addAt(user))
    assigner = reduceToList(assigners)
  }

  return pr ? ` cc ${assigner}` : ` It's been automagically assigned to ${assigner}.`
}
