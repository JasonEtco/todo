/**
 * Determines if a commit is in a pull-request
 * @param {object} context - Probot context object
 * @param {string} sha - Commit sha
 * @returns {number|boolean} - The PR number if it exists or false
 */
async function commitIsInPR (context, sha) {
  const prs = await context.github.pullRequests.getAll(context.repo())
  console.log('PRS:', prs)
  if (!prs || prs.length === 0) return false

  prs.forEach(async pr => {
    console.log('PR:', pr)
    const commits = await context.github.pullRequests.getCommits(context.repo({number: pr.number}))
    console.log('COMMITS:', commits)
    if (commits.some(c => c.sha === sha)) {
      return pr.number
    }
  })
  return false
}

module.exports = commitIsInPR
