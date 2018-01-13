const defaultConfig = require('./default-config')
const generateBody = require('./generate-body')
const commitIsInPR = require('./commit-is-in-pr')
const organizeCommits = require('./organize-commits')
const generateLabel = require('./generate-label')
const reopenClosed = require('./reopen-closed')
const metadata = require('./metadata')
const searchContentsForTitles = require('./search-contents-for-titles')
const checkForDuplicate = require('./check-for-duplicate-issue')
const {assignFlow, getAppComments, truncate} = require('./helpers')

async function search (robot, context, cfg, opts) {
  if (Array.isArray(cfg.keyword)) {
    return cfg.keyword.forEach(k => {
      search(robot, context, { ...cfg, keyword: k }, opts)
    })
  }

  const { file, commitSha, contents, author, pr, repo, labels } = opts
  const titles = searchContentsForTitles(contents, cfg)
  if (!titles) return

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
        return metadata(context, comment).get('title') === title
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

    const issue = context.issue({ title: truncate(title), body, labels, ...assignFlow(cfg, author) })

    robot.log.info(`Creating issue: ${issue.title}, in ${repo}`)
    return context.github.issues.create(issue)
  })
}

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

  // If the tree is too large for one request, it'll have the `truncated` field as true.
  // Right now, *todo* can't support very large trees.
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
      return search(robot, context, cfg, {
        file,
        commitSha,
        contents,
        author,
        pr,
        repo,
        labels
      })
    })
  })
}
