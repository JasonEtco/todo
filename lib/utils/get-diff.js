const MAX_SIZE = 1000000

/**
 * Gets the diff of the commit or pull request as a string
 * @param {import('probot').Context} context
 * @returns {string}
 */
module.exports = async context => {
  let diff

  if (context.event === 'push') {
    diff = await context.github.repos.getCommit(context.repo({
      sha: context.payload.head_commit.id,
      headers: { Accept: 'application/vnd.github.diff' }
    }))
  } else {
    diff = await context.github.pulls.get(context.issue({
      headers: { Accept: 'application/vnd.github.diff' }
    }))
  }

  const size = diff.data.length
  if (size > MAX_SIZE) {
    context.log.info(`Diff is too large: ${size}/${MAX_SIZE}`)
    return
  }

  return diff.data
}
