const defaultConfig = require('./lib/default-config')
const generateBody = require('./lib/generate-body')
const commitIsInPR = require('./lib/commit-is-in-pr')
const organizeCommits = require('./lib/organize-commits')
const generateLabel = require('./lib/generate-label')
const reopenClosed = require('./lib/reopen-closed')
const metadata = require('./lib/metadata')

module.exports = (robot) => {
  robot.on('push', async context => {
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
          const searchPages = await context.github.paginate(context.github.search.issues({
            q: `${title} in:title repo:${context.payload.repository.full_name}`
          }))

          if (searchPages.every(p => p.data.total_count !== 0)) {
            const search = [].concat.apply([], searchPages.map(p => p.data.items))

            const existingIssue = search.find(issue => {
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

          const issueObj = { title, body, labels }
          if (cfg.autoAssign === true) {
            issueObj.assignee = author
          } else if (typeof cfg.autoAssign === 'string') {
            issueObj.assignee = cfg.autoAssign
          } else if (Array.isArray(cfg.autoAssign)) {
            issueObj.assignees = cfg.autoAssign
          }

          const issue = context.issue(issueObj)

          robot.log.info(`Creating issue: ${issue.title}, in ${context.repo().owner}/${context.repo().repo}`)
          return context.github.issues.create(issue)
        })
      })
    })
  })

  robot.on('installation.created', context => {
    const repos = context.payload.repositories.reduce((prev, repo, i, arr) => {
      if (i === 0) return prev + repo.full_name
      if (i === arr.length - 1) return `${prev} and ${repo.full_name}`
      return `${prev}, ${repo.full_name}`
    }, '')
    robot.log.info(`todo was just installed on ${repos}.`)
  })
}
