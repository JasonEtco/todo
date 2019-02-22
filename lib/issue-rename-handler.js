const { titleChange } = require('./templates')

/**
 * @param {import('probot').Context} context
 */
module.exports = async context => {
  const { issue, changes, sender } = context.payload
  const app = process.env.APP_NAME + '[bot]'

  if (sender.login !== app && issue.user.login === app && changes.title) {
    context.log(`Renaming issue #${issue.number} in ${context.repo().owner}/${context.repo().repo}`)
    return Promise.all([
      context.github.issues.update(context.issue({ title: changes.title.from })),
      context.github.issues.createComment(context.issue({
        body: titleChange()
      }))
    ])
  }
}
