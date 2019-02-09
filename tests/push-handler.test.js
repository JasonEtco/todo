const pushEvent = require('./fixtures/payloads/push.json')
const { gimmeApp, loadConfig, loadDiff } = require('./helpers')

describe('push-handler', () => {
  let app, github
  const event = { name: 'push', payload: pushEvent }

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
    github.repos.getCommit.mockReturnValueOnce(loadDiff('long-title'))
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
    github.repos.getCommit.mockReturnValueOnce(loadDiff('none'))
    await app.receive(event)
    expect(github.issues.create).not.toHaveBeenCalled()
  })

  it('does not create any issues if the push is not on the default branch', async () => {
    await app.receive({ name: 'push', payload: { ...pushEvent, ref: 'not-master' } })
    expect(github.issues.create).not.toHaveBeenCalled()
  })

  it('does not create an issue that already exists', async () => {
    github.search.issuesAndPullRequests.mockReturnValueOnce(Promise.resolve({
      data: { total_count: 1, items: [{ title: 'I am an example title', state: 'open' }] }
    }))
    await app.receive(event)
    expect(github.issues.create).not.toHaveBeenCalled()
  })

  it('creates an issue if the search does not have an issue with the correct title', async () => {
    github.search.issuesAndPullRequests.mockReturnValueOnce(Promise.resolve({
      data: { total_count: 1, items: [{ title: 'Not found', state: 'open' }] }
    }))
    await app.receive(event)
    expect(github.issues.create).toHaveBeenCalledTimes(1)
  })

  it('creates many (5) issues', async () => {
    github.repos.getCommit.mockReturnValueOnce(loadDiff('many'))
    await app.receive(event)
    expect(github.issues.create).toHaveBeenCalledTimes(5)
    expect(github.issues.create.mock.calls).toMatchSnapshot()
  })

  it('ignores changes to the config file', async () => {
    github.repos.getCommit.mockReturnValueOnce(loadDiff('config'))
    await app.receive(event)
    expect(github.issues.create).not.toHaveBeenCalled()
  })

  it('ignores changes to the bin directory', async () => {
    github.repos.getCommit.mockReturnValueOnce(loadDiff('bin'))
    github.repos.getContents.mockReturnValueOnce(loadConfig('excludeBin'))
    await app.receive(event)
    expect(github.issues.create).not.toHaveBeenCalled()
  })

  it('ignores pushes not to master', async () => {
    const e = { event: event.event, payload: { ...event.payload, ref: 'not/the/master/branch' } }
    await app.receive(e)
    expect(github.issues.create).not.toHaveBeenCalled()
  })

  it('ignores merge commits', async () => {
    github.git.getCommit.mockReturnValueOnce(Promise.resolve({
      data: { parents: [1, 2] }
    }))
    await app.receive(event)
    expect(github.issues.create).not.toHaveBeenCalled()
  })

  it('creates an issue with a body line', async () => {
    github.repos.getCommit.mockReturnValueOnce(loadDiff('body'))
    await app.receive(event)
    expect(github.issues.create.mock.calls[0]).toMatchSnapshot()
  })

  it('creates an issue with a body line with one body keyword', async () => {
    github.repos.getCommit.mockReturnValueOnce(loadDiff('body'))
    github.repos.getContents.mockReturnValueOnce(loadConfig('bodyString'))
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

  it('does not show the blob if blobLines is false', async () => {
    github.repos.getContents.mockReturnValueOnce(loadConfig('blobLinesFalse'))
    await app.receive(event)
    expect(github.issues.create.mock.calls[0]).toMatchSnapshot()
  })

  it('cuts the blobLines', async () => {
    github.repos.getCommit.mockReturnValueOnce(loadDiff('blob-past-end'))
    await app.receive(event)
    expect(github.issues.create.mock.calls[0]).toMatchSnapshot()
  })

  it('closes an issue on a removed TODO', async () => {
    github.search.issues.mockReturnValueOnce(Promise.resolve({
      data: { total_count: 1, items: [{ title: 'I am an example title', number: 1 }] }
    }))
    github.repos.getCommit.mockReturnValueOnce(loadDiff('remove-todo'))
    await app.receive(event)
    expect(github.issues.edit).toHaveBeenCalled()
    expect(github.issues.edit).toHaveBeenCalledWith({
      number: 1,
      owner: 'JasonEtco',
      repo: 'tests',
      state: 'closed'
    })
  })

  it('does nothing on a non-existant issue on a removed TODO', async () => {
    github.search.issues.mockReturnValueOnce(Promise.resolve({
      data: { total_count: 0, items: [] }
    }))
    github.repos.getCommit.mockReturnValueOnce(loadDiff('remove-todo'))
    await app.receive(event)
    expect(github.issues.edit).not.toHaveBeenCalled()
  })
})
