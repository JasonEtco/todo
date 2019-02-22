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

  it('does nothing on an unmerged, closed PR', async () => {
    await app.receive({
      ...event,
      payload: {
        ...event.payload,
        pull_request: { merged: false }
      }
    })

    expect(github.issues.create).not.toHaveBeenCalled()
  })

  it('creates an issue', async () => {
    await app.receive(event)
    expect(github.issues.create).toHaveBeenCalledTimes(1)
    expect(github.issues.create.mock.calls[0]).toMatchSnapshot()
  })

  it('creates an issue with a truncated title', async () => {
    github.pulls.get.mockReturnValue(loadDiff('long-title'))
    await app.receive(event)
    expect(github.issues.create).toHaveBeenCalledTimes(1)
    expect(github.issues.create.mock.calls[0]).toMatchSnapshot()
  })

  it('creates an issue without assigning anyone', async () => {
    github.repos.getContents.mockReturnValueOnce(loadConfig('autoAssignFalse'))
    await app.receive(event)
    expect(github.issues.create.mock.calls[0]).toMatchSnapshot()
  })

  it('creates an issue and assigns the configured user', async () => {
    github.repos.getContents.mockReturnValueOnce(loadConfig('autoAssignString'))
    await app.receive(event)
    expect(github.issues.create.mock.calls[0]).toMatchSnapshot()
  })

  it('creates an issue and assigns the configured users', async () => {
    github.repos.getContents.mockReturnValueOnce(loadConfig('autoAssignArr'))
    await app.receive(event)
    expect(github.issues.create.mock.calls[0]).toMatchSnapshot()
  })

  it('does not create any issues if no todos are found', async () => {
    github.pulls.get.mockReturnValue(loadDiff('none'))
    await app.receive(event)
    expect(github.issues.create).not.toHaveBeenCalled()
  })

  it('does not create an issue that already exists', async () => {
    github.search.issuesAndPullRequests.mockReturnValueOnce(Promise.resolve({
      data: { total_count: 1, items: [{ title: 'I am an example title', state: 'open' }] }
    }))
    await app.receive(event)
    expect(github.issues.create).not.toHaveBeenCalled()
  })

  it('creates many (5) issues', async () => {
    github.pulls.get.mockReturnValue(loadDiff('many'))
    await app.receive(event)
    expect(github.issues.create).toHaveBeenCalledTimes(5)
  })

  it('ignores changes to the config file', async () => {
    github.pulls.get.mockReturnValue(loadDiff('config'))
    await app.receive(event)
    expect(github.issues.create).not.toHaveBeenCalled()
  })

  it('ignores changes to the bin directory', async () => {
    github.pulls.get.mockReturnValue(loadDiff('bin'))
    github.repos.getContents.mockReturnValueOnce(loadConfig('excludeBin'))
    await app.receive(event)
    expect(github.issues.createComment).not.toHaveBeenCalled()
  })

  it('creates an issue with a body line', async () => {
    github.pulls.get.mockReturnValue(loadDiff('body'))
    await app.receive(event)
    expect(github.issues.create.mock.calls[0]).toMatchSnapshot()
  })

  it('reopens a closed issue', async () => {
    github.search.issuesAndPullRequests.mockReturnValueOnce(Promise.resolve({
      data: { total_count: 1, items: [{ title: 'I am an example title', state: 'closed' }] }
    }))
    await app.receive(event)
    expect(github.issues.update).toHaveBeenCalledTimes(1)
    expect(github.issues.createComment).toHaveBeenCalledTimes(1)
    expect(github.issues.createComment.mock.calls[0]).toMatchSnapshot()
    expect(github.issues.create).not.toHaveBeenCalled()
  })

  it('respects the reopenClosed config', async () => {
    github.repos.getContents.mockReturnValueOnce(loadConfig('reopenClosedFalse'))
    github.search.issuesAndPullRequests.mockReturnValueOnce(Promise.resolve({
      data: { total_count: 1, items: [{ title: 'I am an example title', state: 'closed' }] }
    }))
    await app.receive(event)
    expect(github.issues.update).not.toHaveBeenCalled()
    expect(github.issues.createComment).not.toHaveBeenCalled()
    expect(github.issues.create).not.toHaveBeenCalled()
  })
})
