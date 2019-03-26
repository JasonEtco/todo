/**
 * Edit an open issue
 * @param {object} params
 * @param {import('probot').Context} params.context
 * @param {object} params.issue
 * @param {object} params.body
 */
async function editIssue ({ context, issue, body }) {
  return context.github.issues.update(context.repo({ number: issue.number, body }))
}