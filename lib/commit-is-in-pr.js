/**
 * Determines if a commit is in a pull-request
 * @param {object} context - Probot context object
 * @returns {number|boolean} - The PR number if it exists or false
 */
module.exports = function commitIsInPR (context, prs) {
  if (!prs.data || prs.data.length === 0) return false

  const found = prs.data.find(pr => 'refs/heads/' + pr.head.ref === context.payload.ref)

  if (found) {
    return found.number
  } else {
    return false
  }
}
