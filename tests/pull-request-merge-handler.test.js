const pullRequestClosed = require('./fixtures/payloads/pull_request.closed.json')
const { gimmeApp, loadConfig, loadDiff } = require('./helpers')

describe('pull-request-merged-handler', () => {
  let app, github
  const event = { name: 'pull_request', payload: pullRequestClosed }

  beforeEach(() => {
    const gimme = gimmeApp()
    app = gimme.app
    github = gimme.github
  })

  it('creates an issue', async () => {
    await app.receive(event)
    expect(github.issues.create).toHaveBeenCalledTimes(1)
    expect(github.issues.create.mock.calls[0]).toMatchSnapshot()
  })

  it('creates an issue with a truncated title', async () => {
    github.pullRequests.get.mockReturnValueOnce(loadDiff('long-title'))
    await app.receive(event)
    expect(github.issues.create).toHaveBeenCalledTimes(1)
    expect(github.issues.create.mock.calls[0]).toMatchSnapshot()
  })

  it('creates an issue without assigning anyone', async () => {
    github.repos.getContent.mockReturnValueOnce(loadConfig('autoAssignFalse'))
    await app.receive(event)
    expect(github.issues.create.mock.calls[0]).toMatchSnapshot()
  })

  it('creates an issue and assigns the configured user', async () => {
    github.repos.getContent.mockReturnValueOnce(loadConfig('autoAssignString'))
    await app.receive(event)
    expect(github.issues.create.mock.calls[0]).toMatchSnapshot()
  })

  it('creates an issue and assigns the configured users', async () => {
    github.repos.getContent.mockReturnValueOnce(loadConfig('autoAssignArr'))
    await app.receive(event)
    expect(github.issues.create.mock.calls[0]).toMatchSnapshot()
  })

  it('does not create any issues if no todos are found', async () => {
    github.pullRequests.get.mockReturnValueOnce(loadDiff('none'))
    await app.receive(event)
    expect(github.issues.create).toHaveBeenCalledTimes(0)
  })

  it('does not create an issue that already exists', async () => {
    github.search.issues.mockReturnValueOnce(Promise.resolve({
      data: { total_count: 1, items: [{ title: 'I am an example title', state: 'open' }] }
    }))
    await app.receive(event)
    expect(github.issues.create).toHaveBeenCalledTimes(0)
  })

  it('creates many (5) issues', async () => {
    github.pullRequests.get.mockReturnValueOnce(loadDiff('many'))
    await app.receive(event)
    expect(github.issues.create).toHaveBeenCalledTimes(5)
  })

  it('ignores changes to the config file', async () => {
    github.pullRequests.get.mockReturnValueOnce(loadDiff('config'))
    await app.receive(event)
    expect(github.issues.create).toHaveBeenCalledTimes(0)
  })

  it('ignores changes to the bin directory', async () => {
    github.pullRequests.get.mockReturnValueOnce(loadDiff('bin'))
    github.repos.getContent.mockReturnValueOnce(loadConfig('excludeBin'))
    await app.receive(event)
    expect(github.issues.createComment).toHaveBeenCalledTimes(0)
  })

  it('creates an issue with a body line', async () => {
    github.pullRequests.get.mockReturnValueOnce(loadDiff('body'))
    await app.receive(event)
    expect(github.issues.create.mock.calls[0]).toMatchSnapshot()
  })

  it('reopens a closed issue', async () => {
    github.search.issues.mockReturnValueOnce(Promise.resolve({
      data: { total_count: 1, items: [{ title: 'I am an example title', state: 'closed' }] }
    }))
    await app.receive(event)
    expect(github.issues.edit).toHaveBeenCalledTimes(1)
    expect(github.issues.createComment).toHaveBeenCalledTimes(1)
    expect(github.issues.createComment.mock.calls[0]).toMatchSnapshot()
    expect(github.issues.create).toHaveBeenCalledTimes(0)
  })

  it('respects the reopenClosed config', async () => {
    github.repos.getContent.mockReturnValueOnce(loadConfig('reopenClosedFalse'))
    github.search.issues.mockReturnValueOnce(Promise.resolve({
      data: { total_count: 1, items: [{ title: 'I am an example title', state: 'closed' }] }
    }))
    await app.receive(event)
    expect(github.issues.edit).toHaveBeenCalledTimes(0)
    expect(github.issues.createComment).toHaveBeenCalledTimes(0)
    expect(github.issues.create).toHaveBeenCalledTimes(0)
  })
})
