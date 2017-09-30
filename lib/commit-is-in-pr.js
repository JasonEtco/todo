/**
 * Determines if a commit is in a pull-request
 * @param {object} context - Probot context object
 * @param {string} sha - Commit sha
 * @returns {number|boolean} - The PR number if it exists or false
 */
module.exports = async function commitIsInPR (context, sha) {
  const prs = await context.github.pullRequests.getAll(context.repo())
  if (!prs.data || prs.data.length === 0) return false

  const found = prs.data.find(pr => 'refs/heads/' + pr.head.ref === context.payload.ref)

  if (found) {
    return found.number
  } else {
    return false
  }
}
