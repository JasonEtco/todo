const handlerSetup = require('./utils/handler-setup')
const parseDiff = require('./utils/parse-diff')
const { endDiff } = require('./utils/helpers')
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
  while ((match = regex.exec(endDiff(diff))) !== null) {
    const parsed = parseDiff({ match, context, config })

    if (parsed.filename === '.github/config.yml') continue

    // This PR already has a comment for this item
    if (comments.some(c => c.body.startsWith(`## ${parsed.title}`))) {
      context.log(`Comment with title [${parsed.title}] already exists`)
      continue
    }

    const body = comment(context.repo({
      title: parsed.title,
      body: parsed.body,
      sha: parsed.sha,
      assignedToString: parsed.assignedToString,
      number: parsed.number,
      range: parsed.range,
      filename: parsed.filename,
      keyword: parsed.keyword
    }))

    context.log(`Creating comment [${parsed.title}] in [${context.repo().owner}/${context.repo().repo}#${parsed.number}`)
    await context.github.issues.createComment(context.issue({ body }))
  }
}
