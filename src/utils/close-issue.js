const { close } = require('../templates')

/**
 * Close a issue and post a comment saying what happened and why
 * @param {object} param0
 * @param {Data} data
 */
module.exports = async ({ context, config, issue }, data) => {
  if (issue.state === 'open') {
    await context.github.issues.edit(
      context.repo({
        number: issue.number,
        state: 'closed'
      })
    )

    const body = close(context.repo(data))
    await context.github.issues.createComment(
      context.repo({
        number: issue.number,
        body
      })
    )
  }
}

/**
 * @typedef Data
 * @property {string} keyword
 * @property {string} sha
 * @property {string} filename
 */
