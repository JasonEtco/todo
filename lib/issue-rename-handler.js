const { titleChange } = require('./templates')

module.exports = async context => {
  const { issue, changes, sender } = context.payload
  const app = process.env.APP_NAME + '[bot]'
  console.log(sender.login, app, issue.user.login)

  if (sender.login !== app && issue.user.login === app && changes.title) {
    return Promise.all([
      context.github.issues.edit(context.issue({ title: changes.title.from })),
      context.github.issues.createComment(context.issue({
        body: titleChange()
      }))
    ])
  }
}
