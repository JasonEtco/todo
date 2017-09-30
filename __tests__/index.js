const {createRobot} = require('probot')
const payloads = require('./fixtures/payloads')
const app = require('..')

describe('todo', () => {
  let robot
  let github

  beforeEach(() => {
    robot = createRobot()
    app(robot)

    github = {
      issues: {
        getForRepo: jest.fn()
      },
      repos: {
        // Response for getting content from '.github/todo.yml'
        getContent: jest.fn().mockReturnValue(Promise.resolve({ data: { content: Buffer.from('keyword: "@todo"') } }))
      }
    }
    // Passes the mocked out GitHub API into out robot instance
    robot.auth = () => Promise.resolve(github)
  })

  describe('does a thing', () => {
    it('performs an action', async () => {
      // Simulates delivery of a payload
      await robot.receive(payloads.basic)
      // This test would pass if in your main code you called `context.github.issues.createComment`
      expect(github.issues.getForRepo.mock.calls.length).toBe(1)
    })
  })
})
