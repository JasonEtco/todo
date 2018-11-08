const parseDiff = require('parse-diff')

module.exports = async context => {
  let diff

  if (context.event === 'push') {
    diff = (await context.github.repos.getCommit(context.repo({
      commit_sha: context.payload.head_commit.id,
      headers: { Accept: 'application/vnd.github.diff' }
    }))).data
  } else {
    diff = (await context.github.pullRequests.get(context.issue({
      headers: { Accept: 'application/vnd.github.diff' }
    }))).data
  }

  return parseDiff(diff)
}
