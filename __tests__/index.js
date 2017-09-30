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
        getForRepo: jest.fn().mockReturnValue(Promise.resolve({ data: [] })),
        create: jest.fn()
      },
      repos: {
        // Response for getting content from '.github/todo.yml'
        getContent: jest.fn((obj) => {
          const ret = (str) => Promise.resolve({ data: { content: Buffer.from(str) } })
          if (obj.path.includes('todo.yml')) {
            return ret('keyword: "@todo"')
          } else if (obj.path === 'index.js') {
            return ret('\n\n@todo Jason!\nsdfasd\nsdfas\ndsfsa\n\n\nsdfsdaf')
          }
        })
      },
      pullRequests: {
        getAll: jest.fn().mockReturnValue(Promise.resolve({ data: [{ head: { ref: 'master' }, number: 10 }] }))
      }
    }
    // Passes the mocked out GitHub API into out robot instance
    robot.auth = () => Promise.resolve(github)
  })

  describe('does a thing', () => {
    it('requests issues for the repo', async () => {
      await robot.receive(payloads.basic)
      expect(github.issues.getForRepo.mock.calls.length).toBe(1)
    })

    it('requests issues for the repo', async () => {
      await robot.receive(payloads.basic)
      expect(github.issues.getForRepo.mock.calls.length).toBe(1)
    })

    it('creates an issue', async () => {
      await robot.receive(payloads.basic)
      expect(github.issues.create.mock.calls.length).toBe(1)
    })
  })
})
