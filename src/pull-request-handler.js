const handlerSetup = require('./utils/handler-setup')
const parseChunk = require('./utils/parse-chunk')
const chunkDiff = require('./utils/chunk-diff')
const { comment } = require('./templates')
const { lineBreak } = require('./utils/helpers')

module.exports = async context => {
  const [
    { regex, config },
    chunks
  ] = await Promise.all([
    handlerSetup(context),
    chunkDiff(context)
  ])

  const excludePattern = config.exclude

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]

    let match
    while ((match = regex.exec(chunk)) !== null) {
      const parsed = parseChunk({ match, context, config })

      if (parsed.filename === '.github/config.yml') {
        context.log.debug('Skipping .github/config.yml')
        continue
      } else if (excludePattern && new RegExp(excludePattern).test(parsed.filename)) {
        context.log.debug('Skipping ' + parsed.filename + ' as it matches the exclude pattern ' + excludePattern)
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
