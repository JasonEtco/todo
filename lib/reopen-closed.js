/**
 * Reopen a closed issue and post a comment saying what happened and why
 * @param {object} context - Probot context object
 * @param {object} config - Config object
 * @param {number} number - Issue number
 * @param {string} file - File name
 * @param {string} sha - SHA of the commit
 */
module.exports = async (context, config, number, file, sha) => {
  const body = `This issue has been reopened because the \`${config.keyword}\` comment still exists in \`${file}\`, as of \`${sha}\`.

If this was not intentional, just remove the comment from your code. You can also set the [\`reopenClosed\`](https://github.com/JasonEtco/todo#configuring-for-your-project) config if you don't want this to happen at all anymore.`

  // Change issue to open
  const issue = context.repo({number})
  await context.github.issues.edit({...issue, state: 'open'})

  // Post the comment
  return context.github.issues.createComment({...issue, body})
}
