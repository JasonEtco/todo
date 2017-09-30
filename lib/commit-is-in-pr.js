/**
 * Determines if a commit is in a pull-request
 * @param {object} context - Probot context object
 * @param {string} sha - Commit sha
 * @returns {number|boolean} - The PR number if it exists or false
 */
async function commitIsInPR (context, sha) {
  const prs = await context.github.pullRequests.getAll(context.repo())
  if (!prs.data || prs.data.length === 0) return false

  prs.data.forEach(async pr => {
    const commits = await context.github.pullRequests.getCommits(context.repo({number: pr.number}))
    if (!commits.data || commits.data.length === 0) return false

    if (commits.data.some(c => c.sha === sha)) {
      return pr.number
    }
  })
  return false
}

module.exports = commitIsInPR
