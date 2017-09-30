const defaultConfig = require('./lib/default-config')
const getContents = require('./lib/get-file-contents')
const generateBody = require('./lib/generate-body')
const commitIsInPR = require('./lib/commit-is-in-pr')

module.exports = (robot) => {
  robot.on('push', async context => {
    const cfg = await context.config('todo.yml', defaultConfig)

    const {head_commit} = context.payload
    const author = head_commit.author.username

    // Put together list of new or changes files in this push
    const changedFiles = [...head_commit.added, ...head_commit.modified]

    const files = await changedFiles.reduce(async (prev, file) => {
      // Get the file contents at the given SHA
      const contents = await getContents(context, file)
      return {...prev, [file]: contents}
    }, {})

    // Get array of issue objects in the current repo
    const issues = await context.github.issues.getForRepo(context.issue())

    Object.keys(files).forEach(async file => {
      const contents = files[file]

      // Get issue titles
      const re = new RegExp(`${cfg.keyword}\\s(.*)`, cfg.caseSensitive ? 'g' : 'gi')
      const titles = contents.match(re).map(title => title.replace(`${cfg.keyword} `, ''))
      if (titles.length === 0) return

      titles.forEach(async title => {
        // Check if an issue with that title exists
        if (issues.data.some(issue => issue.title === title && issue.state === 'open')) return

        // :TODO: Reopen existing but closed issues if the same todo is introduced

        const pr = await commitIsInPR(head_commit.id)
        const body = generateBody(context, cfg, title, file, contents, author, head_commit.id, pr)

        // Generate an issue object
        // :TODO: Add labels

        const issueObj = { title, body }
        if (cfg.autoAssign === true) {
          issueObj.assignee = author
        } else if (typeof cfg.autoAssign === 'string') {
          issueObj.assignee = cfg.autoAssign
        } else if (Array.isArray(cfg.autoAssign)) {
          issueObj.assignees = cfg.autoAssign
        }

        const issue = context.issue(issueObj)

        return context.github.issues.create(issue)
      })
    })
  })
}
