const openIssues = require('./lib/open-issues')
const mergeHandler = require('./lib/merge-handler')

module.exports = (robot) => {
  robot.on('push', async context => openIssues(context, robot))
  robot.on('pull_request.merged', async context => mergeHandler(context, robot))

  robot.on('installation.created', context => {
    const repos = context.payload.repositories.reduce((prev, repo, i, arr) => {
      if (i === 0) return prev + repo.full_name
      if (i === arr.length - 1) return `${prev} and ${repo.full_name}`
      return `${prev}, ${repo.full_name}`
    }, '')
    robot.log.info(`todo was just installed on ${repos}.`)
  })
}
