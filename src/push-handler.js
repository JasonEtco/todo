const checkForDuplicateIssue = require('./utils/check-for-duplicate-issue')
const handlerSetup = require('./utils/handler-setup')
const { assignFlow, endDiff } = require('./utils/helpers')
const parseDiff = require('./utils/parse-diff')
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
    { data: diff }
  ] = await Promise.all([
    handlerSetup(context),
    context.github.repos.getCommit(context.repo({
      sha: context.payload.head_commit.id,
      headers: { Accept: 'application/vnd.github.diff' }
    }))
  ])

  let match
  while ((match = regex.exec(endDiff(diff))) !== null) {
    const parsed = parseDiff({ match, context, config })

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

    const regEx = /\/?&lt;br(?:\s\/)?&gt;/g //Regular expression to match all occurences of '&lt;br&gt'
    body = body.replace(regEx, '<br>')
    context.log(`Creating issue [${parsed.title}] in [${context.repo().owner}/${context.repo().repo}]`)
    await context.github.issues.create(context.repo({ title: parsed.title, body, labels, ...assignFlow(config, parsed.username) }))
  }
}
