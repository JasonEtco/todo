const defaultConfig = require('./default-config')
const generateBody = require('./generate-body')
const commitIsInPR = require('./commit-is-in-pr')
const organizeCommits = require('./organize-commits')
const generateLabel = require('./generate-label')
const reopenClosed = require('./reopen-closed')
const metadata = require('./metadata')
const {assignFlow} = require('./helpers')

const APP_NAME = process.env.APP_NAME || 'todo-dev'

module.exports = async (context, robot) => {
  if (!context.payload.head_commit) return

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
        const search = await context.github.search.issues({
          q: `${title} in:title repo:${context.payload.repository.full_name}`,
          per_page: 100
        })

        if (search.data.total_count !== 0) {
          const existingIssue = search.data.items.find(issue => {
            if (!issue.body) return false
            const titleKey = metadata(context, issue).get('title')
            const fileKey = metadata(context, issue).get('file')
            return titleKey === title && fileKey === file
          })

          if (existingIssue) {
            if (cfg.reopenClosed && existingIssue.state === 'closed') {
              return reopenClosed(robot.log, context, cfg, existingIssue.number, file, commitSha)
            } else {
              return
            }
          }
        }

        const body = generateBody(context, cfg, title, file, contents, author, commitSha, pr)

        if (pr) {
          const pullRequest = context.repo({number: pr})

          // Get comments on the pull request (via the issues API)
          const comments = await context.github.issues.getComments(pullRequest)
          const todoComments = comments.data.filter(comment => comment.user.type === 'Bot' && comment.user.login === APP_NAME + '[bot]')
          const existingPRComment = todoComments.some(comment => {
            const titleKey = metadata(context, comment).get('title')
            const fileKey = metadata(context, comment).get('file')
            return titleKey === title && fileKey === file
          })

          if (existingPRComment) {
            return
          } else {
            robot.log.info(`Creating a comment in #${pr}: ${title}`)
            return context.github.issues.createComment(context.repo({
              number: pr,
              body
            }))
          }
        }

        const issue = context.issue({ title, body, labels, ...assignFlow(cfg, author) })

        robot.log.info(`Creating issue: ${issue.title}, in ${context.repo().owner}/${context.repo().repo}`)
        return context.github.issues.create(issue)
      })
    })
  })
}
