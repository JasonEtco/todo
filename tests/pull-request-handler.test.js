const { gimmeRobot, loadDiff } = require('./helpers')
const payloads = require('./fixtures/payloads')
const pullRequestOpened = require('./fixtures/payloads/pull_request.opened.json')

describe('pr-comment-handler', () => {
  let robot, github

  beforeEach(() => {
    const gimme = gimmeRobot()
    robot = gimme.robot
    github = gimme.github
  })

  it('comments on a pull request', async () => {
    await robot.receive({ event: 'pull_request', payload: pullRequestOpened })
    expect(github.issues.create).toHaveBeenCalledTimes(0)
    expect(github.issues.createComment).toHaveBeenCalledTimes(1)
    expect(github.issues.createComment.mock.calls[0][0]).toMatchSnapshot()
  })

  it('comments on a pull request with multiple keywords', async () => {
    const {robot, github} = gimmeRobot('multipleKeywords.yml')
    github.pullRequests.getAll.mockReturnValue(branch)
    github.issues.getComments.mockReturnValueOnce(w([jason]))

    await robot.receive({...payloads.pr,
      payload: {
        ...payloads.pr.payload,
        commits: [{
          ...payloads.pr.payload.commits[0],
          modified: ['multiple-keywords.js']
        }]
      }
    })

    expect(github.issues.create).toHaveBeenCalledTimes(0)
    expect(github.issues.createComment).toHaveBeenCalledTimes(2)
  })

  it('comments on a pull request and mentions the assigned user', async () => {
    const {robot, github} = gimmeRobot('autoAssignString.yml')
    github.pullRequests.getAll.mockReturnValue(branch)
    github.issues.getComments.mockReturnValueOnce(w([jason]))

    await robot.receive(payloads.pr)
    expect(github.issues.createComment).toHaveBeenCalledTimes(1)
  })

  it('comments on a pull request and mentions the assigned users', async () => {
    const {robot, github} = gimmeRobot('autoAssignArr.yml')
    github.pullRequests.getAll.mockReturnValue(branch)
    github.issues.getComments.mockReturnValueOnce(w([jason]))

    await robot.receive(payloads.pr)
    expect(github.issues.createComment).toHaveBeenCalledTimes(1)
  })

  it('does not create duplicate comments', async () => {
    const {robot, github} = gimmeRobot()
    github.pullRequests.getAll.mockReturnValue(branch)
    github.issues.getComments.mockReturnValueOnce(w([jason, bot(comment.body)]))

    await robot.receive(payloads.pr)
    expect(github.issues.createComment).toHaveBeenCalledTimes(0)
  })
})
