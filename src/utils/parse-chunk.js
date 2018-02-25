const generateAssignedTo = require('./generate-assigned-to')
const { truncate } = require('./helpers')

/**
 * Parses diff matches to return information thats ready for templating
 * @param {object} param0 - match, context and config objects
 * @returns {object}
 */
module.exports = ({ match, context, config }) => {
  const {
    1: filename,
    2: lineNumber,
    3: contents,
    4: matchedLine,
    5: prefix,
    6: keyword,
    7: title
  } = match

  context.log(context)
  context.log(`Match found for ${context.event}/${context.id}: ${title}`)

  // Get the line number that the matched line is on
  const addedLines = contents.split(/^-.*\n?/m).join('')
  const matchedLineForReg = new RegExp(`^${matchedLine.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&')}`, 'm')
  const beforeMatch = addedLines.substr(0, addedLines.search(matchedLineForReg))
  const afterMatch = addedLines.substr(addedLines.search(matchedLineForReg))
  const lineSplit = /\r\n|\r|\n/

  // Where the diff starts, plus the number of lines until the matched line
  // minus two because `contents` starts and ends with a \n
  const start = parseInt(lineNumber, 10) + beforeMatch.split(lineSplit).length - 2
  const totalLinesAfterStart = afterMatch.split(lineSplit).length

  let range
  if (totalLinesAfterStart === 1 || start + config.blobLines > start + totalLinesAfterStart) {
    // The matched line is at the end of the file
    range = `L${start}`
  } else if (!config.blobLines) {
    // Don't show the blob
    range = false
  } else {
    range = `L${start}-L${start + config.blobLines}`
  }

  let username, sha
  if (context.payload.head_commit) {
    username = context.payload.head_commit.author.username
    sha = context.payload.head_commit.id
  } else {
    username = context.payload.pull_request.head.user.login
    sha = context.payload.pull_request.head.sha
  }

  const number = context.payload.pull_request ? context.payload.pull_request.number : null
  const assignedToString = generateAssignedTo(config.autoAssign, username, number)

  // Get the body if it exists
  const bodyKeywords = Array.isArray(config.bodyKeyword) ? config.bodyKeyword : [config.bodyKeyword]
  const bodyReg = new RegExp(`^${matchedLine.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&')}\\n^\\+.+(?:${bodyKeywords.join('|')})(?:[:-\\s]+)?(.*)`, 'm')
  const bodyMatch = bodyReg.exec(contents)
  const body = bodyMatch ? bodyMatch[1] : null

  context.log(`Finished parsing ${context.id}: ${title}`)
  return {
    title: truncate(title),
    body,
    filename,
    contents,
    keyword,
    prefix,
    sha,
    number,
    assignedToString,
    range,
    username
  }
}
