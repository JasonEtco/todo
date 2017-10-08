/**
 * Reopen a closed issue and post a comment saying what happened and why
 * @param {function} log - robot.log()
 * @param {object} context - Probot context object
 * @param {object} config - Config object
 * @param {number} number - Issue number
 * @param {string} file - File name
 * @param {string} sha - SHA of the commit
 */
module.exports = async (log, context, config, number, file, sha) => {
  const issue = context.repo({number})
  const link = `https://github.com/${issue.owner}/${issue.repo}/blob/${sha}/${file}`
  const body = `This issue has been reopened because the **\`${config.keyword}\`** comment still exists in [**${file}**](${link}), as of ${sha}.

---
  
###### If this was not intentional, just remove the comment from your code. You can also set the [\`reopenClosed\`](https://github.com/JasonEtco/todo#configuring-for-your-project) config if you don't want this to happen at all anymore.`

  // Change issue to open
  await context.github.issues.edit({...issue, state: 'open'})

  // Post the comment
  log(`Reopening: #${number} in ${issue.owner}/${issue.repo}`)
  return context.github.issues.createComment({...issue, body})
}
