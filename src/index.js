const pullRequestHandler = require('./pull-request-handler')
const pullRequestMergedHandler = require('./pull-request-merged-handler')
const pushHandler = require('./push-handler')
const issueRenameHandler = require('./issue-rename-handler')

module.exports = robot => {
  // PR handler (comments on pull requests)
  robot.on(['pull_request.opened', 'pull_request.synchronize'], pullRequestHandler)

  // Merge handler (opens new issues)
  robot.on('pull_request.closed', pullRequestMergedHandler)

  // Push handler (opens new issues)
  robot.on('push', pushHandler)

  // Prevent tampering with the issue title
  robot.on('issues.edited', issueRenameHandler)
}
