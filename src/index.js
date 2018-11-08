const pullRequestHandler = require('./pull-request-handler')
const pullRequestMergedHandler = require('./pull-request-merged-handler')
const pushHandler = require('./push-handler')
const issueRenameHandler = require('./issue-rename-handler')

module.exports = app => {
  // PR handler (comments on pull requests)
  app.on(['pull_request.opened', 'pull_request.synchronize'], pullRequestHandler)

  // Merge handler (opens new issues)
  app.on('pull_request.closed', pullRequestMergedHandler)

  // Push handler (opens new issues)
  app.on('push', pushHandler)

  // Prevent tampering with the issue title
  app.on('issues.edited', issueRenameHandler)
}
