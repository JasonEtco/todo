const defaultConfig = require('./lib/default-config')
const getContents = require('./lib/get-file-contents')
const generateBody = require('./lib/generate-body')
const commitIsInPR = require('./lib/commit-is-in-pr')
const generateLabel = require('./lib/generate-label')
const reopenClosed = require('./lib/reopen-closed')
const metadata = require('./lib/metadata')

module.exports = (robot) => {
  robot.on('push', async context => {
    if (!context.payload.head_commit) return

    const config = await context.config('config.yml')
    const cfg = config && config.todo ? {...defaultConfig, ...config.todo} : defaultConfig

    const [labels, prs] = await Promise.all([
      generateLabel(context, cfg),
      context.github.pullRequests.getAll(context.repo())
    ])

    const pr = commitIsInPR(context, prs)

    // Get array of issue objects in the current repo
    const {pusher, commits} = context.payload
    const author = pusher.name

    // Get the most up-to-date contents of each file
    // by the commit it was most recently edited in.
    const commitsByFiles = new Map()
    for (let c = 0; c < commits.length; c++) {
      const commit = commits[c]
      const files = [...commit.added, ...commit.modified]
      const mappedFiles = new Map()

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const sliced = commits.slice(c + 1)

        if (sliced.every(com => com.modified.indexOf(file) === -1)) {
          const contents = await getContents(context, commit.id, file)
          mappedFiles.set(file, contents)
          break
        }
      }

      commitsByFiles.set(commit.id, mappedFiles)
    }

    commitsByFiles.forEach(async (files, sha) => {
      files.forEach(async (contents, file) => {
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
                return reopenClosed(robot.log, context, cfg, existingIssue.number, file, sha)
              } else {
                return
              }
            }
          }

          const body = generateBody(context, cfg, title, file, contents, author, sha, pr)

          if (pr) {
            return context.github.pullRequests.createComment(context.repo({
              number: pr,
              body
            }))
          }

          const issueObj = { title, body, labels }
          if (cfg.autoAssign === true) {
            issueObj.assignee = author
          } else if (typeof cfg.autoAssign === 'string') {
            issueObj.assignee = cfg.autoAssign
          } else if (Array.isArray(cfg.autoAssign)) {
            issueObj.assignees = cfg.autoAssign
          }

          const issue = context.issue(issueObj)

          robot.log(`Creating issue: ${issue.title}, in ${context.repo().owner}/${context.repo().repo}`)
          return context.github.issues.create(issue)
        })
      })
    })
  })

  // :TODO: Verify PR merge event name
  robot.on('pull_request.merged', async context => {
    // 1. Get all PR comments
    // 2. Filter for TODO comments
    // 3. For each TODO comment, see if TODO is still in code merged.
    // 4. If yes, open an issue.
  })

  robot.on('installation.created', context => {
    const repos = context.payload.repositories.reduce((prev, repo, i, arr) => {
      if (i === 0) return prev + repo.full_name
      if (i === arr.length - 1) return `${prev} and ${repo.full_name}`
      return `${prev}, ${repo.full_name}`
    }, '')
    robot.log(`todo was just installed on ${repos}.`)
  })
}
