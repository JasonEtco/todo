const handlerSetup = require('./utils/handler-setup')
const parseDiff = require('./utils/parse-diff')
const { truncate } = require('./utils/helpers')
const { comment } = require('./templates')

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

    const parsed = parseDiff({ match, context, config })

    if (parsed.filename === '.github/config.yml') continue
    const title = truncate(parsed.title)

    // This PR already has a comment for this item
    if (comments.some(c => c.body.startsWith(`## ${title}`))) {
      context.log(`Comment with title [${title}] already exists`)
      continue
    }

    const body = comment(context.repo({
      title,
      sha: parsed.sha,
      assignedToString: parsed.assignedToString,
      number: parsed.number,
      start: parsed.start,
      filename: parsed.filename,
      keyword: parsed.keyword
    }))

    await context.github.issues.createComment(context.issue({ body }))
  }
}
