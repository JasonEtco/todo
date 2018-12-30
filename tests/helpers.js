const fs = require('fs')
const path = require('path')
const { Application } = require('probot')
const plugin = require('..')

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
      create: jest.fn().mockName('issues.create'),
      createLabel: jest.fn().mockName('issues.createLabel'),
      edit: jest.fn().mockName('issues.edit'),
      createComment: jest.fn().mockName('issues.createComment'),
      deleteComment: jest.fn().mockName('issues.deleteComment'),
      getComments: jest.fn(() => Promise.resolve({ data: [] })).mockName('issues.getComments')
    },
    search: {
      issues: jest.fn(() => Promise.resolve({ data: { total_count: 0, items: [] } })).mockName('search.issues')
    },
    gitdata: {
      getCommit: jest.fn(() => Promise.resolve({ data: { parents: [1] } })).mockName('gitdata.getCommit')
    },
    repos: {
      // Response for getting content from '.github/todo.yml'
      getContent: jest.fn(() => {
        throw { code: 404 } // eslint-disable-line
      }).mockName('repos.getContent'),
      getCommit: jest.fn(() => loadDiff('basic')).mockName('repos.getCommit')
    },
    pullRequests: {
      get: jest.fn(() => loadDiff('basic')).mockName('pullRequests.get')
    },
    hook: {
      before: jest.fn()
    }
  }
  // Passes the mocked out GitHub API into out app instance
  app.auth = () => Promise.resolve(github)
  return { app, github }
}
