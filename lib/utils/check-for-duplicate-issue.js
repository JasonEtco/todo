/**
 * Checks to see if an issue already exists with the given title.
 * @param {import('probot').Context} context - Probot context object
 * @param {string} title - An issue title
 */
module.exports = async (context, title) => {
  const foundIssue = context.todos.find(i => i.data.title === title)
  if (foundIssue) return foundIssue.data

  const search = await context.github.search.issuesAndPullRequests({
    q: `${title} in:title repo:${context.payload.repository.full_name}`,
    per_page: 100
  })

  if (search.data.total_count !== 0) {
    const existingIssue = search.data.items.find(issue => issue.title === title)
    return existingIssue
  }
}
