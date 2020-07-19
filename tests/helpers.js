const fs = require('fs')
const path = require('path')
const { Application } = require('probot')
const plugin = require('..')

const loadDiff = exports.loadDiff = filename => {
  return Promise.resolve({
    data: fs.readFileSync(path.join(__dirname, 'fixtures', 'diffs', filename + '.txt'), 'utf8'),
    headers: { 'content-length': 1 }
  })
}

exports.loadConfig = filename => {
  return Promise.resolve({
    data: {
      content: fs.readFileSync(path.join(__dirname, 'fixtures', 'configs', filename + '.yml'), 'base64')
    }
  })
}

exports.gimmeApp = () => {
  const logger = {
    trace: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    fatal: jest.fn()
  }

  const app = new Application({
    logger,
    app: {
      getInstallationAccessToken: jest.fn().mockResolvedValue('test'),
      getSignedJsonWebToken: jest.fn().mockReturnValue('test')
    }
  })
  app.load(plugin)

  const github = {
    // Response for getting content from '.github/todo.yml'
    request: jest.fn(() => {
      throw { status: 404 } // eslint-disable-line
    }).mockName('request'),

    issues: {
      create: jest.fn(data => Promise.resolve({ data })).mockName('issues.create'),
      createLabel: jest.fn().mockName('issues.createLabel'),
      update: jest.fn().mockName('issues.update'),
      createComment: jest.fn().mockName('issues.createComment'),
      listComments: jest.fn(() => Promise.resolve({ data: [] })).mockName('issues.listComments')
    },
    search: {
      issuesAndPullRequests: jest.fn(() => Promise.resolve({ data: { total_count: 0, items: [] } })).mockName('search.issuesAndPullRequests')
    },
    git: {
      getCommit: jest.fn(() => Promise.resolve({ data: { parents: [1] } })).mockName('git.getCommit')
    },
    repos: {
      getCommit: jest.fn(() => loadDiff('basic')).mockName('repos.getCommit')
    },
    pulls: {
      get: jest.fn(() => loadDiff('basic')).mockName('pulls.get')
    },
    hook: {
      before: jest.fn()
    }
  }
  // Passes the mocked out GitHub API into out app instance
  app.auth = () => Promise.resolve(github)
  return { app, github }
}
