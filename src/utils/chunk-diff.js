const { endDiff } = require('./helpers')

module.exports = async context => {
  let diff

  if (context.event.event === 'push') {
    diff = (await context.github.repos.getCommit(context.repo({
      commit_sha: context.payload.head_commit.id,
      headers: { Accept: 'application/vnd.github.diff' }
    }))).data
  } else {
    diff = (await context.github.pullRequests.get(context.issue({
      headers: { Accept: 'application/vnd.github.diff' }
    }))).data
  }

  const diffWithEnd = endDiff(diff)
  const reg = /^diff --git\s.+\n[\s\S]+?(?=^diff|^__END_OF_DIFF_PARSING__)/gm

  const chunks = []
  let match
  while ((match = reg.exec(diffWithEnd)) !== null) {
    chunks.push(match[0])
  }

  return chunks
}
