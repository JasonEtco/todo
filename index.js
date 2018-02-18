const pullRequestHandler = require('./lib/pull-request-handler')
const pullRequestMergedHandler = require('./lib/pull-request-merged-handler')
const pushHandler = require('./lib/push-handler')
const issueRenameHandler = require('./lib/issue-rename-handler')

module.exports = robot => {
  // PR handler (comments on pull requests)
  robot.on(['pull_request.opened', 'pull_request.synchronize'], pullRequestHandler)

  // Merge handler (opens new issues)
  robot.on('pull_request.closed', pullRequestMergedHandler)

  // TODO: Don't trigger push handler on merge commits
  // Push handler (opens new issues)
  robot.on('push', pushHandler)

  // Prevent tampering with the issue title
  robot.on('issues.edited', issueRenameHandler)
}
