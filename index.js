const pullRequestHandler = require('./lib/pull-request-handler')
const pullRequestMergedHandler = require('./lib/pull-request-merged-handler')
const pushHandler = require('./lib/push-handler')
const issueRenameHandler = require('./lib/issue-rename-handler')

const handle = handler => {
  return async context => {
    const { owner, repo } = context.repo()

    if (process.env.IGNORED_REPOS) {
      const repos = process.env.IGNORED_REPOS.split(',')
      const fullName = `${owner}/${repo}`
      if (repos.includes(fullName)) {
        context.log(`Specifically ignoring ${fullName} based on IGNORED_REPOS`)
        return
      }
    }

    context.log({ owner, repo }, 'Received event')
    return handler(context)
  }
}

module.exports = app => {
  // PR handler (comments on pull requests)
  app.on(['pull_request.opened', 'pull_request.synchronize'], handle(pullRequestHandler))

  // Merge handler (opens new issues)
  app.on('pull_request.closed', handle(pullRequestMergedHandler))

  // Push handler (opens new issues)
  app.on('push', handle(pushHandler))

  // Prevent tampering with the issue title
  app.on('issues.edited', handle(issueRenameHandler))
}
