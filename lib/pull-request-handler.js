const { comment } = require('./templates')
const { lineBreak } = require('./utils/helpers')
const mainLoop = require('./utils/main-loop')
const avoidReplicationLag = require('./utils/avoid-replication-lag')

module.exports = async context => {
  const { data: comments } = await context.github.issues.getComments(context.issue({
    per_page: 100
  }))

  const { owner, repo, number } = context.issue()

  // Register the hook
  context.github.hook.before('request', avoidReplicationLag())

  return mainLoop(context, async ({
    title,
    keyword,
    sha,
    filename,
    assignedToString,
    range,
    bodyComment,
    type
  }) => {
    const existingComment = comments.find(c => c.body.startsWith(`## ${title}`))

    if (type === 'add') {
      // This PR already has a comment for this item
      if (existingComment) {
        context.log(`Comment with title [${title}] already exists`)
        return
      }

      let body = comment(context.repo({
        title,
        body: bodyComment,
        sha,
        assignedToString,
        number,
        range,
        filename,
        keyword
      }))

      body = lineBreak(body)
      context.log(`Creating comment [${title}] in [${owner}/${repo}#${number}]`)
      return context.github.issues.createComment(context.issue({ body }))
    }

    if (type === 'del' && existingComment) {
      // Delete the comment
      return context.github.issues.editComment(context.issue({
        comment_id: existingComment.id,
        body: `<details><summary><strong>${title}</strong> ✅</summary>\n\n${existingComment.body}</details>`
      }))
    }
  })
}
