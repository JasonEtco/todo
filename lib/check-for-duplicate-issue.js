const metadata = require('./metadata')

/**
 * Checks to see if an issue already exists with the given title.
 * @param {object} context - Probot context object
 * @param {object} cfg - Config object
 * @param {string} title - An issue title
 */
module.exports = async (context, cfg, title) => {
  const search = await context.github.search.issues({
    q: `${title} in:title repo:${context.payload.repository.full_name}`,
    per_page: 100
  })

  if (search.data.total_count !== 0) {
    const existingIssue = search.data.items.find(issue => {
      if (!issue.body) return false
      return metadata(context, issue).get('title') === title
    })

    if (existingIssue) {
      if (cfg.reopenClosed && existingIssue.state === 'closed') {
        return existingIssue
      } else {
        return null
      }
    }
  }
}
