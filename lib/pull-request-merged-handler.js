const generateAssignedTo = require('./generate-assigned-to')
const checkForDuplicateIssue = require('./check-for-duplicate-issue')
const handlerSetup = require('./handler-setup')
const { issue } = require('./templates')
const { truncate } = require('./helpers')

module.exports = async context => {
  const [
    { regex, config },
    { data: diff }
  ] = await Promise.all([
    handlerSetup(context),
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

    // Prevent duplicates
    const existingIssue = await checkForDuplicateIssue(context, title)
    if (existingIssue) {
      context.log(`Duplicate issue found with title [${title}]`)
      continue
    }

    const lineNumber = parseInt(match[2])

    context.log({ filename, lineNumber, matchedLine, prefix, keyword, title })

    const addedLines = contents.split(/^-.*\n?/m).join('')
    const beforeMatch = addedLines.substring(0, addedLines.indexOf('\n' + matchedLine))

    // Where the diff starts, plus the number of lines until the matched line
    // minus one because `contents` starts with a \n
    const start = lineNumber + beforeMatch.split(/\r\n|\r|\n/).length - 1

    const { sha, user } = context.payload.pull_request.head
    const assignedToString = generateAssignedTo(config.autoAssign, user.login)
    const body = issue(context.repo({
      sha,
      assignedToString,
      start,
      filename,
      keyword
    }))

    await context.github.issues.create(context.repo({ title: truncate(title), body }))
  }
}
