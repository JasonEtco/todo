const {gimmeRobot} = require('./helpers')
const payloads = require('./fixtures/payloads')

describe('pr comments', () => {
  it('comments on a pull request', async () => {
    const {robot, github} = gimmeRobot()
    github.pullRequests.getAll.mockReturnValue(Promise.resolve({ data: [{ head: { ref: 'branch' }, number: 10 }] }))
    await robot.receive(payloads.pr)
    expect(github.issues.create).toHaveBeenCalledTimes(0)
    expect(github.pullRequests.createComment).toHaveBeenCalledTimes(1)
  })

  it('comments on a pull request and mentions the assigned user', async () => {
    const {robot, github} = gimmeRobot('autoAssignString.yml')
    github.pullRequests.getAll.mockReturnValue(Promise.resolve({ data: [{ head: { ref: 'branch' }, number: 10 }] }))
    await robot.receive(payloads.pr)
    expect(github.issues.create).toHaveBeenCalledTimes(0)
    expect(github.pullRequests.createComment).toHaveBeenCalledTimes(1)
  })

  it('comments on a pull request and mentions the assigned users', async () => {
    const {robot, github} = gimmeRobot('autoAssignArr.yml')
    github.pullRequests.getAll.mockReturnValue(Promise.resolve({ data: [{ head: { ref: 'branch' }, number: 10 }] }))
    await robot.receive(payloads.pr)
    expect(github.issues.create).toHaveBeenCalledTimes(0)
    expect(github.pullRequests.createComment).toHaveBeenCalledTimes(1)
  })
})
