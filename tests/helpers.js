const fs = require('fs')
const path = require('path')
const { Application } = require('probot')
const plugin = require('../src')

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

exports.gimmeApp = () => {
  let app, github

  const logger = {
    trace: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    fatal: jest.fn()
  }

  app = new Application({ logger })
  app.load(plugin)

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
    gitdata: {
      getCommit: jest.fn(() => Promise.resolve({ data: { parents: [1] } }))
    },
    repos: {
      // Response for getting content from '.github/todo.yml'
      getContent: jest.fn(() => {
        throw { code: 404 } // eslint-disable-line
      }),
      getCommit: jest.fn(() => loadDiff('basic'))
    },
    pullRequests: {
      get: jest.fn(() => loadDiff('basic'))
    }
  }
  // Passes the mocked out GitHub API into out app instance
  app.auth = () => Promise.resolve(github)
  return { app, github }
}
