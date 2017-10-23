const metadata = require('./metadata')

module.exports = async (context, cfg, title, file) => {
  const search = await context.github.search.issues({
    q: `${title} in:title repo:${context.payload.repository.full_name}`,
    per_page: 100
  })

  if (search.data.total_count !== 0) {
    const existingIssue = search.data.items.find(issue => {
      if (!issue.body) return false
      const titleKey = metadata(context, issue).get('title')
      const fileKey = metadata(context, issue).get('file')
      return titleKey === title && fileKey === file
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
