const checkForDuplicateIssue = require('./utils/check-for-duplicate-issue')
const handlerSetup = require('./utils/handler-setup')
const { assignFlow, lineBreak, truncate } = require('./utils/helpers')
const chunkDiff = require('./utils/chunk-diff')
const reopenClosed = require('./utils/reopen-closed')
const getDeets = require('./utils/get-deets')
const { issue } = require('./templates')
const checkForBody = require('./utils/check-for-body')
const shouldExcludeFile = require('./utils/should-exclude-file')

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

  for (const file of files) {
    if (shouldExcludeFile(context.log, file.to, config.exclude)) continue

    for (const chunk of file.chunks) {
      for (const indexStr in chunk.changes) {
        const index = parseInt(indexStr, 10)
        const change = chunk.changes[index]

        const matches = regex.exec(change.content)
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
        let body = lineBreak(issue(context.repo({
          sha: deets.sha,
          assignedToString: deets.assignedToString,
          range: deets.range,
          filename: file.to,
          keyword,
          body: checkForBody(chunk.changes, index, config)
        })))

        await context.github.issues.create(context.repo({ title: truncate(title), body, labels, ...assignFlow(config, deets.username) }))
      }
    }
  }
}
