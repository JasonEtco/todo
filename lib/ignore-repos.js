module.exports = function ignoreRepos (handler) {
  return async context => {
    const { owner, repo } = context.repo()

    if (process.env.IGNORED_REPOS) {
      const repos = process.env.IGNORED_REPOS.split(',')
      const fullName = `${owner}/${repo}`
      if (repos.includes(fullName)) {
        context.log(`Specifically ignoring ${fullName} based on IGNORED_REPOS`)
        return
      }
    }

    context.log({ owner, repo }, 'Received event')
    return handler(context)
  }
}
