/**
 * Gets the diff of the commit or pull request as a string
 * @returns {string}
 */
module.exports = async context => {
  let diff

  if (context.event === 'push') {
    diff = (await context.github.repos.getCommit(context.repo({
      sha: context.payload.head_commit.id,
      headers: { Accept: 'application/vnd.github.diff' }
    }))).data
  } else {
    diff = (await context.github.pullRequests.get(context.issue({
      headers: { Accept: 'application/vnd.github.diff' }
    }))).data
  }

  return diff
}
