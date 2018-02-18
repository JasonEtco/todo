const pullRequestClosed = require('./fixtures/payloads/pull_request.closed.json')
const { gimmeRobot, loadConfig, loadDiff } = require('./helpers')

describe('pull-request-merged-handler', () => {
  let robot, github
  const event = { event: 'pull_request', payload: pullRequestClosed }

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
    github.pullRequests.get.mockReturnValueOnce(loadDiff('long-title'))
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
    github.pullRequests.get.mockReturnValueOnce(loadDiff('none'))
    await robot.receive(event)
    expect(github.issues.create).toHaveBeenCalledTimes(0)
  })

  // it('does nothing on a merge commit', async () => {
  //   const {robot, github} = gimmeRobot()
  //   github.gitdata.getCommit.mockReturnValueOnce(Promise.resolve({
  //     data: { parents: [1, 2] }
  //   }))
  //   await robot.receive(payloads.basic)
  //   expect(github.issues.create).toHaveBeenCalledTimes(0)
  // })

  it('does not create an issue that already exists', async () => {
    github.search.issues.mockReturnValueOnce(Promise.resolve({
      data: { total_count: 1, items: [{ title: 'I am an example title', state: 'open' }] }
    }))
    await robot.receive(event)
    expect(github.issues.create).toHaveBeenCalledTimes(0)
  })

  it('creates many (5) issues', async () => {
    github.pullRequests.get.mockReturnValueOnce(loadDiff('many'))
    await robot.receive(event)
    expect(github.issues.create).toHaveBeenCalledTimes(5)
  })

  it('ignores changes to the config file', async () => {
    github.pullRequests.get.mockReturnValueOnce(loadDiff('config'))
    await robot.receive(event)
    expect(github.issues.create).toHaveBeenCalledTimes(0)
  })

  // it('reopens a closed issue', async () => {
  //   const issues = {data: {
  //     items: [{
  //       title: 'An issue that exists',
  //       state: 'open',
  //       body: `\n\n<!-- probot = {"10000":{"title": "An issue that exists","file": "index.js"}} -->`
  //     }, {
  //       title: 'Jason!',
  //       state: 'closed',
  //       body: `\n\n<!-- probot = {"10000":{"title": "Jason!","file": "index.js"}} -->`
  //     }],
  //     total_count: 2
  //   }}
  //   const {robot, github} = gimmeRobot('basic.yml', issues)
  //   await robot.receive(payloads.basic)
  //   expect(github.issues.edit).toHaveBeenCalledTimes(1)
  //   expect(github.issues.createComment).toHaveBeenCalledTimes(1)
  //   expect(github.issues.create).toHaveBeenCalledTimes(0)
  // })

  // it('respects the reopenClosed config', async () => {
  //   const issues = {data: {
  //     items: [{
  //       title: 'An issue that exists',
  //       state: 'open',
  //       body: `\n\n<!-- probot = {"10000":{"title": "An issue that exists","file": "index.js"}} -->`
  //     }, {
  //       title: 'Jason!',
  //       state: 'closed',
  //       body: `\n\n<!-- probot = {"10000":{"title": "Jason!","file": "index.js"}} -->`
  //     }],
  //     total_count: 2
  //   }}
  //   const {robot, github} = gimmeRobot('reopenClosedFalse.yml', issues)
  //   await robot.receive(payloads.basic)
  //   expect(github.issues.edit).toHaveBeenCalledTimes(0)
  //   expect(github.issues.createComment).toHaveBeenCalledTimes(0)
  //   expect(github.issues.create).toHaveBeenCalledTimes(0)
  // })
})
