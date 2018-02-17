const pullRequestHandler = require('./lib/pull-request-handler')
const pullRequestMergedHandler = require('./lib/pull-request-merged-handler')

module.exports = robot => {
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

  robot.on(['pull_request.opened', 'pull_request.synchronize'], pullRequestHandler)

  // Merge handler
  robot.on('pull_request.closed', pullRequestMergedHandler)
}
