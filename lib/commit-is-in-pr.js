/**
 * Determines if a commit is in a pull-request
 * @param {object} context - Probot context object
 * @param {string} sha - Commit sha
 * @returns {number|boolean} - The PR number if it exists or false
 */
async function commitIsInPR (context, sha) {
  const prs = await context.github.pullRequests.getAll()

  prs.forEach(async pr => {
    const commits = await context.github.pullRequests.getCommits(context.repo({number: pr.number}))
    if (commits.some(c => c.sha === sha)) {
      return pr.number
    }
  })
  return false
}

module.exports = commitIsInPR
