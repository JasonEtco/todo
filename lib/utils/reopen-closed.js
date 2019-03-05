const { reopenClosed } = require('../templates')

/**
 * Reopen a closed issue and post a comment saying what happened and why
 * @param {object} params
 * @param {import('probot').Context} params.context
 * @param {object} params.config
 * @param {object} params.issue
 * @param {Data} data
 */
module.exports = async ({context, config, issue}, data) => {
  if (issue.state === 'closed' && config.reopenClosed) {
    await context.github.issues.update(context.repo({
      number: issue.number,
      state: 'open'
    }))

    const body = reopenClosed(context.repo(data))
    return context.github.issues.createComment(context.repo({
      number: issue.number,
      body
    }))
  }
}

/**
 * @typedef Data
 * @property {string} keyword
 * @property {string} sha
 * @property {string} filename
 */
