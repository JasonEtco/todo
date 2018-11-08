const generateAssignedTo = require('./generate-assigned-to')

module.exports = (context, config, n) => {
  const number = context.payload.pull_request ? context.payload.pull_request.number : null

  let username, sha
  if (context.payload.head_commit) {
    username = context.payload.head_commit.author.username
    sha = context.payload.head_commit.id
  } else {
    username = context.payload.pull_request.head.user.login
    sha = context.payload.pull_request.head.sha
  }

  const assignedToString = generateAssignedTo(config.autoAssign, username, number)

  let range
  if (!config.blobLines) {
    // Don't show the blob
    range = false
  } else {
    range = `L${n + 1}-L${n + 1 + config.blobLines}`
  }

  return {
    username,
    sha,
    assignedToString,
    number,
    range
  }
}
