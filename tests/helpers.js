const fs = require('fs')
const path = require('path')
const {createRobot} = require('probot')
const app = require('../')

exports.gimmeRobot = (config = false) => {
  const cfg = config ? fs.readFileSync(path.join(__dirname, 'fixtures', 'configs', config), 'utf8') : config
  let robot
  let github

  const logger = {
    trace: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    fatal: jest.fn()
  }

  robot = createRobot({ logger })
  app(robot)

  github = {
    issues: {
      create: jest.fn(),
      createLabel: jest.fn(),
      edit: jest.fn(),
      createComment: jest.fn(),
      getComments: jest.fn().mockReturnValue(Promise.resolve({ data: [] }))
    },
    search: {
      issues: jest.fn().mockReturnValue(Promise.resolve({ data: { total_count: 0, items: [] } }))
    },
    repos: {
      // Response for getting content from '.github/todo.yml'
      getContent: jest.fn(() => {
        if (config === false) {
          throw { code: 404 } // eslint-disable-line
        }
        return Promise.resolve({ data: { content: Buffer.from(cfg) } })
      })
    },
    pullRequests: {
      get: jest.fn().mockReturnValue(Promise.resolve({ data: '' }))
    }
  }
  // Passes the mocked out GitHub API into out robot instance
  robot.auth = () => Promise.resolve(github)
  return { robot, github }
}

exports.loadDiff = filename => {
  return fs.readFileSync(path.join(__dirname, 'fixtures', 'diffs', filename + '.txt'), 'utf8')
}
