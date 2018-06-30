const { gimmeApp, loadConfig, loadDiff } = require('./helpers')
const pullRequestOpened = require('./fixtures/payloads/pull_request.opened.json')

describe('pull-request-handler', () => {
  let app, github
  const event = { event: 'pull_request', payload: pullRequestOpened }

  beforeEach(() => {
    const gimme = gimmeApp()
    app = gimme.app
    github = gimme.github
  })

  it('comments on a pull request', async () => {
    await app.receive(event)
    expect(github.issues.createComment).toHaveBeenCalledTimes(1)
    expect(github.issues.createComment.mock.calls[0]).toMatchSnapshot()
  })

  it('comments on a pull request and mentions the assigned user', async () => {
    github.repos.getContent.mockReturnValueOnce(loadConfig('autoAssignString'))
    await app.receive(event)
    expect(github.issues.createComment.mock.calls[0]).toMatchSnapshot()
  })

  it('comments on a pull request and mentions the assigned users', async () => {
    github.repos.getContent.mockReturnValueOnce(loadConfig('autoAssignArr'))
    await app.receive(event)
    expect(github.issues.createComment.mock.calls[0]).toMatchSnapshot()
  })

  it('does not create duplicate comments', async () => {
    github.issues.getComments.mockReturnValueOnce(Promise.resolve({ data: [{
      body: '## I am an example title'
    }] }))

    await app.receive(event)
    expect(github.issues.createComment).toHaveBeenCalledTimes(0)
  })

  it('creates many (5) comments', async () => {
    github.pullRequests.get.mockReturnValueOnce(loadDiff('many'))
    await app.receive(event)
    expect(github.issues.createComment).toHaveBeenCalledTimes(5)
  })

  it('ignores changes to the config file', async () => {
    github.pullRequests.get.mockReturnValueOnce(loadDiff('config'))
    await app.receive(event)
    expect(github.issues.createComment).toHaveBeenCalledTimes(0)
  })

  it('ignores changes to the bin directory', async () => {
    github.pullRequests.get.mockReturnValueOnce(loadDiff('bin'))
    github.repos.getContent.mockReturnValueOnce(loadConfig('excludeBin'))
    await app.receive(event)
    expect(github.issues.createComment).toHaveBeenCalledTimes(0)
  })

  it('works with a string as the keyword config', async () => {
    github.repos.getContent.mockReturnValueOnce(loadConfig('keywordsString'))
    await app.receive(event)
    expect(github.issues.createComment.mock.calls[0]).toMatchSnapshot()
  })

  it('creates a comment with a body line', async () => {
    github.pullRequests.get.mockReturnValueOnce(loadDiff('body'))
    await app.receive(event)
    expect(github.issues.createComment.mock.calls[0]).toMatchSnapshot()
  })
})
