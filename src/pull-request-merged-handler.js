const parseChunk = require('./utils/parse-chunk')
const chunkDiff = require('./utils/chunk-diff')
const checkForDuplicateIssue = require('./utils/check-for-duplicate-issue')
const handlerSetup = require('./utils/handler-setup')
const reopenClosed = require('./utils/reopen-closed')
const { assignFlow, lineBreak } = require('./utils/helpers')
const { issueFromMerge } = require('./templates')

module.exports = async context => {
  const [
    { regex, config, labels },
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

      // Prevent duplicates
      const existingIssue = await checkForDuplicateIssue(context, parsed.title)
      if (existingIssue) {
        context.log(`Duplicate issue found with title [${parsed.title}]`)
        await reopenClosed({ context, config, issue: existingIssue }, parsed)
        continue
      }

      let body = issueFromMerge(context.repo({
        sha: parsed.sha,
        assignedToString: parsed.assignedToString,
        range: parsed.range,
        filename: parsed.filename,
        keyword: parsed.keyword,
        number: parsed.number,
        body: parsed.body
      }))

      body = lineBreak(body)
      context.log(`Creating issue [${parsed.title}] in [${context.repo().owner}/${context.repo().repo}]`)
      await context.github.issues.create(context.repo({ title: parsed.title, body, labels, ...assignFlow(config, parsed.username) }))
    }
  }
}
