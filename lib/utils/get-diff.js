/**
 * This value will take some tweaking. A really large diff
 * is in the hundred thousands (288421 prompted this change),
 * but they can go way higher and would result in downtime.
 */
const MAX_DIFF_SIZE = 150000

/**
 * Gets the commit using the diff header
 * @param {import('probot').Context} context
 * @param {string} [method='GET']
 */
async function getCommit (context, method = 'GET') {
  if (context.event === 'push') {
    return context.github.repos.getCommit(context.repo({
      method,
      commit_sha: context.payload.head_commit.id,
      headers: { Accept: 'application/vnd.github.diff' }
    }))
  } else {
    return context.github.pulls.get(context.issue({
      method,
      headers: { Accept: 'application/vnd.github.diff' }
    }))
  }
}

/**
 * Gets the diff of the commit or pull request as a string
 * @param {import('probot').Context} context
 * @returns {string}
 */
module.exports = async context => {
  const headRequest = await getCommit(context, 'HEAD')
  const diffSize = headRequest.headers['content-length']
  if (diffSize > MAX_DIFF_SIZE) {
    context.log.info(`Diff is too large: ${diffSize}/${MAX_DIFF_SIZE}`)
    return
  }

  const diff = await getCommit(context)
  return diff.data
}
