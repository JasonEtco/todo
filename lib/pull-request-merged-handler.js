const checkForExistingIssue = require('./utils/check-for-existing-issue')
const reopenClosed = require('./utils/reopen-closed')
const { assignFlow, lineBreak, truncate } = require('./utils/helpers')
const { issueFromMerge } = require('./templates')
const mainLoop = require('./utils/main-loop')
const avoidReplicationLag = require('./utils/avoid-replication-lag')

module.exports = async context => {
  // Don't act on PRs that were close but not merged
  if (!context.payload.pull_request.merged) return

  context.github.hook.before('request', avoidReplicationLag())

  return mainLoop(context, async ({
    title,
    config,
    filename,
    range,
    assignedToString,
    keyword,
    number,
    bodyComment,
    sha,
    labels,
    username,
    type
  }) => {
    const existingIssue = await checkForExistingIssue(context, title)
    if (type === 'add') {
      // Prevent duplicates
      if (existingIssue) {
        context.log(`Duplicate issue found with title [${title}]`)
        return reopenClosed({ context, config, issue: existingIssue }, {
          keyword,
          title,
          sha,
          filename
        })
      }

      let body = issueFromMerge(context.repo({
        sha,
        assignedToString,
        range,
        filename,
        keyword,
        number,
        body: bodyComment
      }))

      body = lineBreak(body)
      const { owner, repo } = context.repo()
      context.log(`Creating issue [${title}] in [${owner}/${repo}]`)
      return context.github.issues.create(context.repo({
        title: truncate(title),
        body,
        labels,
        ...assignFlow(config, username)
      }))
    } else {
      // Close the issue
    }
  })
}
