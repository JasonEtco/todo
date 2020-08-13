const { comment } = require('./templates')
const { lineBreak } = require('./utils/helpers')
const mainLoop = require('./utils/main-loop')

/**
 * @param {import('probot').Context} context
 */
module.exports = async context => {
  const { data: comments } = await context.github.issues.listComments(context.issue())

  return mainLoop(context, async ({
    title,
    keyword,
    sha,
    filename,
    assignedToString,
    range,
    bodyComment
  }) => {
    // This PR already has a comment for this item
    if (comments.some(c => c.body.startsWith(`## ${title}`))) {
      context.log(`Comment with title [${title}] already exists`)
      return
    }

    let body = comment(context.issue({
      title,
      body: bodyComment,
      sha,
      assignedToString,
      range,
      filename,
      keyword
    }))

    body = lineBreak(body)
    const { owner, repo } = context.repo()
    context.log(`Creating comment [${title}] in [${owner}/${repo}#${context.issue().issue_number}]`)
    return context.github.issues.createComment(context.issue({ body }))
  })
}
