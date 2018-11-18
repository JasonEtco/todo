const { comment } = require('./templates')
const { lineBreak } = require('./utils/helpers')
const theLoop = require('./utils/the-loop')

module.exports = async context => {
  const {data: comments} = await context.github.issues.getComments(context.issue({}))
  const { number } = context.issue()

  return theLoop(context, async ({
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
    context.log(`Creating comment [${title}] in [${context.repo().owner}/${context.repo().repo}#${number}]`)
    return context.github.issues.createComment(context.issue({ body }))
  })
}
