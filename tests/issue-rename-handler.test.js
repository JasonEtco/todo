const { createRobot } = require('probot')
const issueEdited = require('./fixtures/payloads/issues.edited.json')
const plugin = require('../')

describe('issue-rename-handler', () => {
  let robot, github
  const event = { event: 'issues', payload: issueEdited }

  beforeEach(() => {
    robot = createRobot()

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

  afterEach(() => {
    delete process.env.APP_NAME
  })
})
