const generateAssignedTo = require('./generate-assigned-to')
const checkForDuplicateIssue = require('./check-for-duplicate-issue')
const handlerSetup = require('./handler-setup')
const { issue } = require('./templates')

module.exports = async context => {
  // Only trigger push handler on pushes to master
  if (context.payload.ref !== `refs/heads/${context.payload.repository.master_branch}`) {
    return
  }

  const [
    { regex, config },
    { data: diff }
  ] = await Promise.all([
    handlerSetup(context),
    context.github.repos.getCommit(context.repo({
      sha: context.payload.head_commit.id,
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
      return
    }

    const lineNumber = parseInt(match[2])

    context.log({ filename, lineNumber, matchedLine, prefix, keyword, title })

    const split = contents.substring(0, contents.indexOf(matchedLine)).split(/(?:\r\n|\n)/g)
    const start = lineNumber + split.length

    const { id: sha, author } = context.payload.head_commit
    const assignedToString = generateAssignedTo(config.autoAssign, author.username)
    const body = issue(context.repo({
      sha,
      assignedToString,
      start,
      filename,
      keyword
    }))

    return context.github.issues.create(context.repo({ title, body }))
  }
}
