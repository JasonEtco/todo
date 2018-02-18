const { createRobot } = require('probot')
const issueEdited = require('./fixtures/payloads/issues.edited.json')
const plugin = require('../')

describe('issue-rename-handler', () => {
  let robot, github, event

  beforeEach(() => {
    robot = createRobot()
    event = { event: 'issues', payload: issueEdited }

    github = {
      issues: {
        edit: jest.fn(),
        createComment: jest.fn()
      }
    }

    robot.auth = jest.fn(() => Promise.resolve(github))
    process.env.APP_NAME = 'test-app'
    plugin(robot)
  })

  it('un-edits the issue title', async () => {
    await robot.receive(event)
    expect(github.issues.edit.mock.calls[0][0]).toMatchSnapshot()
    expect(github.issues.createComment.mock.calls[0][0]).toMatchSnapshot()
  })

  it('only acts if the title is edited', async () => {
    event.payload.changes = {}
    await robot.receive(event)
    expect(github.issues.edit).not.toHaveBeenCalled()
    expect(github.issues.createComment).not.toHaveBeenCalled()
  })

  afterEach(() => {
    delete process.env.APP_NAME
  })
})
