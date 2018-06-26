const handlerSetup = require('./utils/handler-setup')
const parseChunk = require('./utils/parse-chunk')
const chunkDiff = require('./utils/chunk-diff')
const { comment } = require('./templates')
const { lineBreak } = require('./utils/helpers')

module.exports = async context => {
  const [
    { regex, config },
    { data: comments },
    chunks
  ] = await Promise.all([
    handlerSetup(context),
    context.github.issues.getComments(context.issue({})),
    chunkDiff(context)
  ])

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]

    let match
    while ((match = regex.exec(chunk)) !== null) {
      const parsed = parseChunk({ match, context, config })

      if (parsed.filename === '.github/config.yml' || (config.exclude && parsed.filename.test(new RegExp(config.exclude)))) {
          continue
      }

      // This PR already has a comment for this item
      if (comments.some(c => c.body.startsWith(`## ${parsed.title}`))) {
        context.log(`Comment with title [${parsed.title}] already exists`)
        continue
      }

      let body = comment(context.repo({
        title: parsed.title,
        body: parsed.body,
        sha: parsed.sha,
        assignedToString: parsed.assignedToString,
        number: parsed.number,
        range: parsed.range,
        filename: parsed.filename,
        keyword: parsed.keyword
      }))

      body = lineBreak(body)
      context.log(`Creating comment [${parsed.title}] in [${context.repo().owner}/${context.repo().repo}#${parsed.number}]`)
      await context.github.issues.createComment(context.issue({ body }))
    }
  }
}
