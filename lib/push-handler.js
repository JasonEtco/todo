const checkForDuplicateIssue = require('./utils/check-for-duplicate-issue')
const handlerSetup = require('./utils/handler-setup')
const { truncate, assignFlow, endDiff } = require('./utils/helpers')
const parseDiff = require('./utils/parse-diff')
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
    context.log('Match found')
    const parsed = parseDiff({ match, context, config })

    if (parsed.filename === '.github/config.yml') continue
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
      keyword: parsed.keyword,
      body: parsed.body
    }))

    await context.github.issues.create(context.repo({ title, body, labels, ...assignFlow(config, parsed.username) }))
  }
}
