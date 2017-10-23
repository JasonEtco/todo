const fs = require('fs')
const path = require('path')
const {createRobot} = require('probot')
const app = require('../')

const defaultIssues = { data: {items: [{ title: 'An issue that exists', state: 'open', body: `\n\n<!-- probot = {"10000":{"title": "An issue that exists","file": "index.js"}} -->` }], total_count: 1} }
const defaultTree = [
  { path: 'index.js', sha: 'sha' },
  { path: 'more.js', sha: 'sha' },
  { path: 'another.js', sha: 'sha' },
  { path: 'many.js', sha: 'sha' },
  { path: 'caseinsensitive.js', sha: 'sha' }
]

exports.gimmeRobot = (config = 'basic.yml', issues = defaultIssues, tree = defaultTree) => {
  const cfg = config ? fs.readFileSync(path.join(__dirname, 'fixtures', 'configs', config), 'utf8') : config
  let robot
  let github
  const content = (str) => Promise.resolve({ data: { content: Buffer.from(str) } })

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
      getForRepo: jest.fn().mockReturnValue(Promise.resolve(issues)),
      create: jest.fn(),
      createLabel: jest.fn(),
      edit: jest.fn(),
      createComment: jest.fn(),
      getComments: jest.fn().mockReturnValue(Promise.resolve({ data: [] }))
    },
    search: {
      issues: jest.fn().mockReturnValue(Promise.resolve(issues))
    },
    gitdata: {
      getTree: jest.fn().mockReturnValue(Promise.resolve({
        data: { tree }
      })),
      getCommit: jest.fn().mockReturnValue(Promise.resolve({
        data: { parents: [1] }
      })),
      getBlob: jest.fn((obj) => ({
        data: {
          content: fs.readFileSync(path.join(__dirname, 'fixtures', 'files', obj.path), 'base64')
        }
      }))
    },
    repos: {
      // Response for getting content from '.github/todo.yml'
      getContent: jest.fn((obj) => {
        if (obj.path.includes('config.yml')) {
          if (config === false) {
            throw { code: 404 } // eslint-disable-line
          }
          return content(cfg)
        } else {
          return content(fs.readFileSync(path.join(__dirname, 'fixtures', 'files', obj.path), 'utf8'))
        }
      }),
      getShaOfCommitRef: jest.fn().mockReturnValue(Promise.resolve({ data: { sha: 'sha' } }))
    },
    pullRequests: {
      getAll: jest.fn().mockReturnValue(Promise.resolve({ data: [{ head: { ref: 'master' } }] }))
    }
  }
  // Passes the mocked out GitHub API into out robot instance
  robot.auth = () => Promise.resolve(github)
  return { robot, github }
}
