const pullRequestHandler = require('./lib/pull-request-handler')
const pullRequestMergedHandler = require('./lib/pull-request-merged-handler')
const pushHandler = require('./lib/push-handler')
const issueRenameHandler = require('./lib/issue-rename-handler')
const ignoreRepos = require('./lib/ignore-repos')

/**
 * @param {import('probot').Application} app
 */
module.exports = app => {
  // PR handler (comments on pull requests)
  app.on(['pull_request.opened', 'pull_request.synchronize'], ignoreRepos(pullRequestHandler))

  // Merge handler (opens new issues)
  app.on('pull_request.closed', ignoreRepos(pullRequestMergedHandler))

  // Push handler (opens new issues)
  app.on('push', ignoreRepos(pushHandler))

  // Prevent tampering with the issue title
  app.on('issues.edited', ignoreRepos(issueRenameHandler))
}
