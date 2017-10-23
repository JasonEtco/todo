const {getAppComments, assignFlow} = require('./helpers')
const getContents = require('./get-file-contents')
const metadata = require('./metadata')
const defaultConfig = require('./default-config')
const generateBody = require('./generate-body')
const generateLabel = require('./generate-label')
const checkForDuplicate = require('./check-for-duplicate-issue')
const reopenClosed = require('./reopen-closed')

module.exports = async (context, robot) => {
  const {number, pull_request} = context.payload
  if (pull_request.merged) {
    const config = await context.config('config.yml')
    const cfg = config && config.todo ? {...defaultConfig, ...config.todo} : defaultConfig

    const {sha} = pull_request.head
    const todoComments = await getAppComments(context, number)

    const [labels, tree] = await Promise.all([
      generateLabel(context, cfg),
      context.github.gitdata.getTree(context.repo({sha, recursive: true}))
    ])

    if (tree.truncated) {
      robot.log.error(new Error('Tree was too large for one recursive request.'))
      return
    }

    // For each TODO comment, see if TODO is still in code merged.
    todoComments.forEach(async comment => {
      const file = metadata(context, comment).get('file')
      const fileInTree = tree.data.tree.find(f => f.path === file)
      if (fileInTree) {
        const title = metadata(context, comment).get('title')
        const contents = await getContents(context, fileInTree.sha, file)

        // Check if contents contains the TODO title
        const regexFlags = cfg.caseSensitive ? 'g' : 'gi'
        const re = new RegExp(`${cfg.keyword}\\s${title}`, regexFlags)

        const matches = contents.match(re)
        if (!matches) return
        // Check if an issue with that title exists
        const existingIssue = await checkForDuplicate(context, cfg, title, file)
        if (existingIssue) {
          return reopenClosed(robot.log, context, cfg, existingIssue.number, file, sha)
        } else if (existingIssue === null) {
          return
        }

        const author = pull_request.merged_by.login
        const body = generateBody(context, cfg, title, file, contents, author, sha, number, false)
        const issue = context.issue({ title, body, labels, ...assignFlow(cfg, author) })

        robot.log.info(`Creating issue from PR #${number} in ${context.repo().owner}/${context.repo().repo}: ${title}`)
        return context.github.issues.create(issue)
      }
    })
  }
}
