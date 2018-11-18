const checkForDuplicateIssue = require('./utils/check-for-duplicate-issue')
const handlerSetup = require('./utils/handler-setup')
const { assignFlow, lineBreak, truncate } = require('./utils/helpers')
const chunkDiff = require('./utils/chunk-diff')
const parseChunk = require('./utils/parse-chunk')
const reopenClosed = require('./utils/reopen-closed')
const getDeets = require('./utils/get-deets')
const { issue } = require('./templates')
const checkForBody = require('./utils/check-for-body')

module.exports = async context => {
  // Only trigger push handler on pushes to master
  if (context.payload.ref !== `refs/heads/${context.payload.repository.master_branch}`) {
    return
  }

  // Do not trigger on merge commits
  const commit = await context.github.gitdata.getCommit(context.repo({commit_sha: context.payload.head_commit.id}))
  if (commit.data.parents.length > 1) return

  const [
    { regex, config, labels },
    files
  ] = await Promise.all([
    handlerSetup(context),
    chunkDiff(context)
  ])

  const keywords = Array.isArray(config.keyword) ? config.keyword : [config.keyword]
  const TITLE_REG = new RegExp(`.+()\\s(?<keyword>${keywords.join('|')})\\s(?<title>.*)`)
  const excludePattern = config.exclude

  let match
  for (const file of files) {
    if (file.to === '.github/config.yml') {
      context.log.debug('Skipping .github/config.yml')
      continue
    } else if (excludePattern && new RegExp(excludePattern).test(file.to)) {
      context.log.debug('Skipping ' + file.to + ' as it matches the exclude pattern ' + excludePattern)
      continue
    }

    for (const chunk of file.chunks) {
      for (const indexStr in chunk.changes) {
        const index = parseInt(indexStr, 10)
        const change = chunk.changes[index]
        const matches = TITLE_REG.exec(change.content)
        if (!matches) continue

        const { title, keyword } = matches.groups

        const deets = getDeets({ context, config, chunk, line: change.ln || change.ln2 })

        // Prevent duplicates
        const existingIssue = await checkForDuplicateIssue(context, title)
        if (existingIssue) {
          context.log(`Duplicate issue found with title [${title}]`)
          await reopenClosed({ context, config, issue: existingIssue }, { keyword, sha: deets.sha, filename: file.to })
          continue
        }

        // Actually create the issue
        let body = issue(context.repo({
          sha: deets.sha,
          assignedToString: deets.assignedToString,
          range: deets.range,
          filename: file.to,
          keyword,
          body: checkForBody(chunk.changes, index, config)
        }))

        await context.github.issues.create(context.repo({ title: truncate(title), body, labels, ...assignFlow(config, deets.username) }))
      }
    }
  }

  return

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]

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

      let body = issue(context.repo({
        sha: parsed.sha,
        assignedToString: parsed.assignedToString,
        range: parsed.range,
        filename: parsed.filename,
        keyword: parsed.keyword,
        body: parsed.body
      }))

      body = lineBreak(body)
      context.log(`Creating issue [${parsed.title}] in [${context.repo().owner}/${context.repo().repo}]`)
      await context.github.issues.create(context.repo({ title: parsed.title, body, labels, ...assignFlow(config, parsed.username) }))
    }
  }
}
