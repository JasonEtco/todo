const checkForDuplicateIssue = require('./utils/check-for-duplicate-issue')
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
    bodyComment
  }) => {
    // Prevent duplicates
    const existingIssue = await checkForDuplicateIssue(context, title)
    if (existingIssue) {
      if (typeof existingIssue === 'string') return
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
  })
}
