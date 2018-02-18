const fs = require('fs')
const path = require('path')
const {createRobot} = require('probot')
const app = require('../')

const loadDiff = exports.loadDiff = filename => {
  return Promise.resolve({
    data: fs.readFileSync(path.join(__dirname, 'fixtures', 'diffs', filename + '.txt'), 'utf8')
  })
}

exports.loadConfig = filename => {
  return Promise.resolve({
    data: {
      content: Buffer.from(fs.readFileSync(path.join(__dirname, 'fixtures', 'configs', filename + '.yml'), 'utf8'))
    }
  })
}

exports.gimmeRobot = () => {
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
      getComments: jest.fn(() => Promise.resolve({ data: [] }))
    },
    search: {
      issues: jest.fn(() => Promise.resolve({ data: { total_count: 0, items: [] } }))
    },
    repos: {
      // Response for getting content from '.github/todo.yml'
      getContent: jest.fn(() => {
        throw { code: 404 } // eslint-disable-line
      })
    },
    pullRequests: {
      get: jest.fn(() => loadDiff('basic'))
    }
  }
  // Passes the mocked out GitHub API into out robot instance
  robot.auth = () => Promise.resolve(github)
  return { robot, github }
}
