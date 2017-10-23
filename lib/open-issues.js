const defaultConfig = require('./default-config')
const generateBody = require('./generate-body')
const commitIsInPR = require('./commit-is-in-pr')
const organizeCommits = require('./organize-commits')
const generateLabel = require('./generate-label')
const reopenClosed = require('./reopen-closed')
const metadata = require('./metadata')
const checkForDuplicate = require('./check-for-duplicate-issue')
const {assignFlow, getAppComments} = require('./helpers')

module.exports = async (context, robot) => {
  if (!context.payload.head_commit) return

  // Do nothing if this is a merge commit
  const commit = await context.github.gitdata.getCommit(context.repo({sha: context.payload.head_commit.id}))
  if (commit.data.parents.length > 1) return

  const repo = `${context.repo().owner}/${context.repo().repo}`
  const config = await context.config('config.yml')
  const cfg = config && config.todo ? {...defaultConfig, ...config.todo} : defaultConfig

  const [labels, prs, tree] = await Promise.all([
    generateLabel(context, cfg),
    context.github.pullRequests.getAll(context.repo()),
    context.github.gitdata.getTree(context.repo({sha: context.payload.head_commit.id, recursive: true}))
  ])

  if (tree.truncated) {
    robot.log.error(new Error('Tree was too large for one recursive request.'))
    return
  }

  const pr = commitIsInPR(context, prs)

  // Get array of issue objects in the current repo
  const {pusher, commits} = context.payload
  const author = pusher.name

  // Get the most up-to-date contents of each file
  // by the commit it was most recently edited in.
  const commitsByFiles = await organizeCommits(context, commits, tree)
  commitsByFiles.forEach(async (files, commitSha) => {
    files.forEach(async ({ contents, sha }, file) => {
      // Get issue titles
      const regexFlags = cfg.caseSensitive ? 'g' : 'gi'
      const re = new RegExp(`${cfg.keyword}\\s(.*)`, regexFlags)
      const matches = contents.match(re)
      if (!matches) return

      const titles = matches.map(title => title.replace(new RegExp(`${cfg.keyword} `, regexFlags), ''))

      titles.forEach(async title => {
        // Check if an issue with that title exists
        const existingIssue = await checkForDuplicate(context, cfg, title, file)
        if (existingIssue) {
          return reopenClosed(robot.log, context, cfg, existingIssue.number, file, commitSha)
        } else if (existingIssue === null) {
          return
        }

        const body = generateBody(context, cfg, title, file, contents, author, commitSha, pr)

        if (pr) {
          const todoComments = await getAppComments(context, pr)

          // Get comments on the pull request (via the issues API)
          const existingPRComment = todoComments.some(comment => {
            const titleKey = metadata(context, comment).get('title')
            const fileKey = metadata(context, comment).get('file')
            return titleKey === title && fileKey === file
          })

          if (existingPRComment) {
            return
          } else {
            robot.log.info(`Creating a comment in #${pr} in ${repo}: ${title}`)
            return context.github.issues.createComment(context.repo({
              number: pr,
              body
            }))
          }
        }

        const issue = context.issue({ title, body, labels, ...assignFlow(cfg, author) })

        robot.log.info(`Creating issue: ${issue.title}, in ${repo}`)
        return context.github.issues.create(issue)
      })
    })
  })
}
