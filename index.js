const {getContents, generateBody} = require('./helpers')

module.exports = (robot) => {
  robot.on('push', async context => {
    const {head_commit} = context.payload
    const author = head_commit.author.username

    const changedFiles = [...head_commit.added, ...head_commit.modified]
    const files = await changedFiles.reduce(async (prev, file) => {
      const contents = await getContents(context, file)
      return Object.assign({}, prev, { [file]: contents })
    }, {})

    const issues = await context.github.issues.getForRepo(context.issue())

    Object.keys(files).forEach(async file => {
      const contents = files[file]
      // Get @todo titles
      const titles = contents.match(/@todo\s(.*)/gi).map(title => title.replace('@todo ', ''))
      titles.forEach(async title => {
        // Check if an issue with that title exists
        if (issues.data.some(issue => issue.title === title && issue.state === 'open')) return

        // @todo Reopen existing but closed issues if the same todo is introduced

        const body = generateBody(title, file, contents, author, head_commit.id)

        // Generate an issue object
        // @todo Add labels
        const issue = context.issue({ title, body, assignee: author })

        return context.github.issues.create(issue)
      })
    })
  })
}
