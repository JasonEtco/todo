const handlerSetup = require('./handler-setup')
const generateAssignedTo = require('./generate-assigned-to')
const { comment } = require('./templates')
const { truncate } = require('./helpers')

module.exports = async context => {
  const [
    { regex, config },
    { data: comments },
    { data: diff }
  ] = await Promise.all([
    handlerSetup(context),
    context.github.issues.getComments(context.issue({})),
    context.github.pullRequests.get(context.issue({
      headers: { Accept: 'application/vnd.github.diff' }
    }))
  ])

  let match
  while ((match = regex.exec(diff)) !== null) {
    context.log('Match found')
    const {
      1: filename,
      3: contents,
      4: matchedLine,
      5: prefix,
      6: keyword,
      7: title
    } = match

    // This PR already has a comment for this item
    if (comments.some(c => c.body.startsWith(`## ${title}`))) {
      context.log(`Comment with title [${title}] already exists`)
      return
    }

    const lineNumber = parseInt(match[2])

    context.log({ filename, lineNumber, matchedLine, prefix, keyword, title })

    const addedLines = contents.split(/^-.*\n?/m).join('')
    const beforeMatch = addedLines.substring(0, addedLines.indexOf('\n' + matchedLine))

    // Where the diff starts, plus the number of lines until the matched line
    // minus one because `contents` starts with a \n
    const start = lineNumber + beforeMatch.split(/\r\n|\r|\n/).length - 1

    const { sha, user } = context.payload.pull_request.head
    const { number } = context.payload.pull_request

    const assignedToString = generateAssignedTo(config.autoAssign, user.login, number)
    const body = comment(context.repo({
      title: truncate(title),
      sha,
      assignedToString,
      number,
      start,
      filename,
      keyword
    }))

    return context.github.issues.createComment(context.issue({ body }))
  }
}
