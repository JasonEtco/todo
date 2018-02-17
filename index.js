const pullRequestHandler = require('./lib/pull-request-handler')
const pullRequestMergedHandler = require('./lib/pull-request-merged-handler')
const pushHandler = require('./lib/push-handler')
const { titleChange } = require('./lib/templates')

module.exports = robot => {
  // PR handler (comments on pull requests)
  robot.on(['pull_request.opened', 'pull_request.synchronize'], pullRequestHandler)

  // Merge handler (opens new issues)
  robot.on('pull_request.closed', pullRequestMergedHandler)

  // TODO: Don't trigger push handler on merge commits
  // Push handler (opens new issues)
  robot.on('push', pushHandler)

  // Prevent tampering with the issue title
  robot.on('issues.edited', async context => {
    const { issue, changes, sender } = context.payload
    const app = process.env.APP_NAME + '[bot]'

    if (sender.login !== app && issue.user.login === app && changes.title) {
      return Promise.all([
        context.github.issues.edit(context.issue({ title: changes.title.from })),
        context.github.issues.createComment(context.issue({
          body: titleChange()
        }))
      ])
    }
  })
}
