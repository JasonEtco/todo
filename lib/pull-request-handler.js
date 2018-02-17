const handlerSetup = require('./handler-setup')
const generateAssignedTo = require('./generate-assigned-to')
const { comment } = require('./templates')

module.exports = async context => {
  const { data: diff } = await context.github.pullRequests.get(context.issue({
    headers: { Accept: 'application/vnd.github.diff' }
  }))
  const { regex, config } = await handlerSetup(context)
  const comments = await context.github.issues.getComments(context.issue({}))

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
    if (comments.data.some(c => c.body.startsWith(`## ${title}`))) {
      context.log(`Comment with title [${title}] already exists`)
      return
    }

    const lineNumber = parseInt(match[2])

    context.log({ filename, lineNumber, matchedLine, prefix, keyword, title })

    const split = contents.substring(0, contents.indexOf(matchedLine)).split(/(?:\r\n|\n)/g)
    const start = lineNumber + split.length

    const { sha, user } = context.payload.pull_request.head
    const { number } = context.payload.pull_request

    const assignedToString = generateAssignedTo(config.autoAssign, user.login, number)
    const body = comment(context.repo({
      title,
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
