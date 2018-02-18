const generateAssignedTo = require('./generate-assigned-to')

module.exports = ({ match, context, config }) => {
  const {
    1: filename,
    3: contents,
    4: matchedLine,
    5: prefix,
    6: keyword,
    7: title
  } = match

  const lineNumber = parseInt(match[2])

  const addedLines = contents.split(/^-.*\n?/m).join('')
  const beforeMatch = addedLines.substring(0, addedLines.indexOf('\n' + matchedLine))

  // Where the diff starts, plus the number of lines until the matched line
  // minus one because `contents` starts with a \n
  const start = lineNumber + beforeMatch.split(/\r\n|\r|\n/).length - 1

  let username, sha
  if (context.payload.head_commit) {
    username = context.payload.head_commit.author.username
    sha = context.payload.head_commit.id
  } else {
    username = context.payload.pull_request.head.user.login
    sha = context.payload.pull_request.head.sha
  }

  const number = context.payload.pull_request && context.payload.action !== 'closed'
    ? context.payload.pull_request.number
    : null
  const assignedToString = generateAssignedTo(config.autoAssign, username, number)

  return {
    filename,
    contents,
    keyword,
    prefix,
    sha,
    number,
    assignedToString,
    start,
    title,
    username
  }
}
