const pullRequestHandler = require('./lib/pull-request-handler')
const pullRequestMergedHandler = require('./lib/pull-request-merged-handler')
const { titleChange } = require('./templates')

module.exports = robot => {
  // PR handler (comments on pull requests)
  robot.on(['pull_request.opened', 'pull_request.synchronize'], pullRequestHandler)

  // Merge handler (opens new issues)
  robot.on('pull_request.closed', pullRequestMergedHandler)

  // Push handler (opens new issues)
  robot.on('push', async context => {
    // Only trigger push handler on pushes to master
    if (context.payload.ref !== `refs/heads/${context.payload.repository.master_branch}`) {
      return
    }

    const { data: diff } = await context.github.repos.getCommit(context.repo({
      sha: context.payload.head_commit.sha,
      headers: { Accept: 'application/vnd.github.diff' }
    }))

    console.log(diff)
  })

  // Prevent tampering with the issue title
  robot.on('issues.edited', async context => {
    const { issue, changes, sender } = context.payload
    const app = process.env.APP_NAME + '[bot]'

    if (sender.login !== app && issue.user.login === app && changes.title) {
      return Promise.all([
        context.github.issues.edit(context.issue({ title: changes.title.from })),
        context.github.issues.createComment(context.issue({
          body: titleChange()
        }))
      ])
    }
  })
}
