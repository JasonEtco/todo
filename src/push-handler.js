const checkForDuplicateIssue = require('./utils/check-for-duplicate-issue')
const handlerSetup = require('./utils/handler-setup')
const { assignFlow, lineBreak } = require('./utils/helpers')
const chunkDiff = require('./utils/chunk-diff')
const parseChunk = require('./utils/parse-chunk')
const reopenClosed = require('./utils/reopen-closed')
const { issue } = require('./templates')

module.exports = async context => {
  // Only trigger push handler on pushes to master
  if (context.payload.ref !== `refs/heads/${context.payload.repository.master_branch}`) {
    return
  }

  // Do not trigger on merge commits
  const commit = await context.github.gitdata.getCommit(context.repo({sha: context.payload.head_commit.id}))
  if (commit.data.parents.length > 1) return

  const [
    { regex, config, labels },
    chunks
  ] = await Promise.all([
    handlerSetup(context),
    chunkDiff(context)
  ])

  let match
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]

    while ((match = regex.exec(chunk)) !== null) {
      const parsed = parseChunk({ match, context, config })

      if (parsed.filename === '.github/config.yml') continue

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

<<<<<<< HEAD
      body = lineBreak(body)
=======
      const regEx = /\/?&lt;br(?:\s\/)?&gt;/g // Regular expression to match all occurences of '&lt;br&gt'
      body = body.replace(regEx, '<br>')
>>>>>>> origin/Make-Line-Breaks-Work
      context.log(`Creating issue [${parsed.title}] in [${context.repo().owner}/${context.repo().repo}]`)
      await context.github.issues.create(context.repo({ title: parsed.title, body, labels, ...assignFlow(config, parsed.username) }))
    }
  }
}
