const checkForExistingIssue = require('./utils/check-for-existing-issue')
const { assignFlow, lineBreak, truncate } = require('./utils/helpers')
const reopenClosed = require('./utils/reopen-closed')
const { issue } = require('./templates')
const mainLoop = require('./utils/main-loop')

/**
 * @param {import('probot').Context} context
 */
module.exports = async context => {
  // Only trigger push handler on pushes to master
  if (context.payload.ref !== `refs/heads/${context.payload.repository.master_branch}`) {
    return
  }

  // Do not trigger on merge commits
  const commit = await context.github.git.getCommit(context.repo({commit_sha: context.payload.head_commit.id}))
  if (commit.data.parents.length > 1) return

  return mainLoop(context, async ({
    title,
    config,
    keyword,
    sha,
    filename,
    assignedToString,
    range,
    labels,
    username,
    bodyComment,
    type
  }) => {
    const existingIssue = await checkForExistingIssue(context, title)

    if (type === 'add') {
      // Prevent duplicates
      if (existingIssue) {
        context.log(`Duplicate issue found with title [${title}]`)
        return reopenClosed({ context, config, issue: existingIssue }, { keyword, sha, filename })
      }

      // Actually create the issue
      let body = lineBreak(issue(context.repo({
        sha,
        assignedToString,
        range,
        filename,
        keyword,
        body: bodyComment
      })))

      const { owner, repo } = context.repo()
      context.log(`Creating issue [${title}] in [${owner}/${repo}]`)
      return context.github.issues.create(context.repo({
        title: truncate(title),
        body,
        labels,
        ...assignFlow(config, username)
      }))
    }

    if (type === 'del' && existingIssue) {
      // Close the issue
      return context.github.issues.edit(context.repo({
        number: existingIssue.number,
        state: 'closed'
      }))
    }
  })
}
