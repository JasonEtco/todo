const { gimmeRobot, loadConfig, loadDiff } = require('./helpers')
const pullRequestOpened = require('./fixtures/payloads/pull_request.opened.json')

describe('pull-request-handler', () => {
  let robot, github
  const event = { event: 'pull_request', payload: pullRequestOpened }

  beforeEach(() => {
    const gimme = gimmeRobot()
    robot = gimme.robot
    github = gimme.github
  })

  it('comments on a pull request', async () => {
    await robot.receive(event)
    expect(github.issues.createComment).toHaveBeenCalledTimes(1)
    expect(github.issues.createComment.mock.calls[0]).toMatchSnapshot()
  })

  it('comments on a pull request and mentions the assigned user', async () => {
    github.repos.getContent.mockReturnValueOnce(loadConfig('autoAssignString'))
    await robot.receive(event)
    expect(github.issues.createComment.mock.calls[0]).toMatchSnapshot()
  })

  it('comments on a pull request and mentions the assigned users', async () => {
    github.repos.getContent.mockReturnValueOnce(loadConfig('autoAssignArr'))
    await robot.receive(event)
    expect(github.issues.createComment.mock.calls[0]).toMatchSnapshot()
  })

  it('does not create duplicate comments', async () => {
    github.issues.getComments.mockReturnValueOnce(Promise.resolve({ data: [{
      body: '## I am an example title'
    }] }))

    await robot.receive(event)
    expect(github.issues.createComment).toHaveBeenCalledTimes(0)
  })

  it('creates many (5) comments', async () => {
    github.pullRequests.get.mockReturnValueOnce(loadDiff('many'))
    await robot.receive(event)
    expect(github.issues.createComment).toHaveBeenCalledTimes(5)
  })
})
