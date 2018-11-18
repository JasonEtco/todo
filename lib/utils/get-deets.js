const generateAssignedTo = require('./generate-assigned-to')

function getFileBoundaries (lastChange, line, padding = 2) {
  const end = Math.min(line + padding, lastChange.ln || lastChange.ln2)

  // Gotta add one because diffs are weird
  return { start: line + 1, end: end + 1 }
}

module.exports = ({ context, chunk, config, line }) => {
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
    const lastChange = chunk.changes[chunk.changes.length - 1]
    const { start, end } = getFileBoundaries(lastChange, line, config.blobLines)
    range = start === end ? `L${start}` : `L${start}-L${end}`
  }

  return {
    username,
    sha,
    assignedToString,
    number,
    range
  }
}
