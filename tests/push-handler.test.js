const pushEvent = require('./fixtures/payloads/push.json')
const { gimmeRobot, loadConfig, loadDiff } = require('./helpers')

describe('push-handler', () => {
  let robot, github
  const event = { event: 'push', payload: pushEvent }

  beforeEach(() => {
    const gimme = gimmeRobot()
    robot = gimme.robot
    github = gimme.github
  })

  it('creates an issue', async () => {
    await robot.receive(event)
    expect(github.issues.create).toHaveBeenCalledTimes(1)
    expect(github.issues.create.mock.calls[0]).toMatchSnapshot()
  })

  it('creates an issue with a truncated title', async () => {
    github.repos.getCommit.mockReturnValueOnce(loadDiff('long-title'))
    await robot.receive(event)
    expect(github.issues.create).toHaveBeenCalledTimes(1)
    expect(github.issues.create.mock.calls[0]).toMatchSnapshot()
  })

  it('creates an issue without assigning anyone', async () => {
    github.repos.getContent.mockReturnValueOnce(loadConfig('autoAssignFalse'))
    await robot.receive(event)
    expect(github.issues.create.mock.calls[0]).toMatchSnapshot()
  })

  it('creates an issue and assigns the configured user', async () => {
    github.repos.getContent.mockReturnValueOnce(loadConfig('autoAssignString'))
    await robot.receive(event)
    expect(github.issues.create.mock.calls[0]).toMatchSnapshot()
  })

  it('creates an issue and assigns the configured users', async () => {
    github.repos.getContent.mockReturnValueOnce(loadConfig('autoAssignArr'))
    await robot.receive(event)
    expect(github.issues.create.mock.calls[0]).toMatchSnapshot()
  })

  it('does not create any issues if no todos are found', async () => {
    github.repos.getCommit.mockReturnValueOnce(loadDiff('none'))
    await robot.receive(event)
    expect(github.issues.create).toHaveBeenCalledTimes(0)
  })

  it('does not create an issue that already exists', async () => {
    github.search.issues.mockReturnValueOnce(Promise.resolve({
      data: { total_count: 1, items: [{ title: 'I am an example title', state: 'open' }] }
    }))
    await robot.receive(event)
    expect(github.issues.create).toHaveBeenCalledTimes(0)
  })

  it('creates an issue if the search does not have an issue with the correct title', async () => {
    github.search.issues.mockReturnValueOnce(Promise.resolve({
      data: { total_count: 1, items: [{ title: 'Not found', state: 'open' }] }
    }))
    await robot.receive(event)
    expect(github.issues.create).toHaveBeenCalledTimes(1)
  })

  it('creates many (5) issues', async () => {
    github.repos.getCommit.mockReturnValueOnce(loadDiff('many'))
    await robot.receive(event)
    expect(github.issues.create).toHaveBeenCalledTimes(5)
  })

  it('ignores changes to the config file', async () => {
    github.repos.getCommit.mockReturnValueOnce(loadDiff('config'))
    await robot.receive(event)
    expect(github.issues.create).toHaveBeenCalledTimes(0)
  })

  it('ignores pushes not to master', async () => {
    const e = { event: event.event, payload: { ...event.payload, ref: 'not/the/master/branch' } }
    await robot.receive(e)
    expect(github.issues.create).toHaveBeenCalledTimes(0)
  })

  it('ignores merge commits', async () => {
    github.gitdata.getCommit.mockReturnValueOnce(Promise.resolve({
      data: { parents: [1, 2] }
    }))
    await robot.receive(event)
    expect(github.issues.create).toHaveBeenCalledTimes(0)
  })

  it('creates an issue with a body line', async () => {
    github.repos.getCommit.mockReturnValueOnce(loadDiff('body'))
    await robot.receive(event)
    expect(github.issues.create.mock.calls[0]).toMatchSnapshot()
  })

  it('creates an issue with a body line with one body keyword', async () => {
    github.repos.getCommit.mockReturnValueOnce(loadDiff('body'))
    github.repos.getContent.mockReturnValueOnce(loadConfig('bodyString'))
    await robot.receive(event)
    expect(github.issues.create.mock.calls[0]).toMatchSnapshot()
  })

  it('reopens a closed issue', async () => {
    github.search.issues.mockReturnValueOnce(Promise.resolve({
      data: { total_count: 1, items: [{ title: 'I am an example title', state: 'closed' }] }
    }))
    await robot.receive(event)
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
    await robot.receive(event)
    expect(github.issues.edit).toHaveBeenCalledTimes(0)
    expect(github.issues.createComment).toHaveBeenCalledTimes(0)
    expect(github.issues.create).toHaveBeenCalledTimes(0)
  })
})
