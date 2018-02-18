const parseDiff = require('./utils/parse-diff')
const checkForDuplicateIssue = require('./utils/check-for-duplicate-issue')
const handlerSetup = require('./utils/handler-setup')
const { truncate, assignFlow } = require('./utils/helpers')
const { issue } = require('./templates')

module.exports = async context => {
  const [
    { regex, config, labels },
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
    const parsed = parseDiff({ match, context, config })
    const title = truncate(parsed.title)

    // Prevent duplicates
    const existingIssue = await checkForDuplicateIssue(context, title)
    if (existingIssue) {
      context.log(`Duplicate issue found with title [${title}]`)
      continue
    }

    const body = issue(context.repo({
      sha: parsed.sha,
      assignedToString: parsed.assignedToString,
      start: parsed.start,
      filename: parsed.filename,
      keyword: parsed.keyword
    }))

    await context.github.issues.create(context.repo({ title, body, labels, ...assignFlow(config, parsed.username) }))
  }
}
