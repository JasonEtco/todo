const {createRobot} = require('probot')
const payloads = require('./fixtures/payloads')
const app = require('..')
const fs = require('fs')
const path = require('path')
const request = require('supertest')

function gimmeRobot (config = 'basic.yml') {
  const cfg = fs.readFileSync(path.join(__dirname, 'fixtures', 'configs', config), 'utf8')
  let robot
  let github
  const content = (str) => Promise.resolve({ data: { content: Buffer.from(str) } })

  robot = createRobot()
  app(robot)

  github = {
    issues: {
      getForRepo: jest.fn().mockReturnValue(Promise.resolve({ data: [{ title: 'An issue that exists', state: 'open' }] })),
      create: jest.fn()
    },
    repos: {
      // Response for getting content from '.github/todo.yml'
      getContent: jest.fn((obj) => {
        if (obj.path.includes('config.yml')) {
          return content(cfg)
        } else if (obj.path === 'index.js') {
          return content('\n\n@todo Jason!\nsdfasd\nsdfas\ndsfsa\n\n\nsdfsdaf\n@existing An issue that exists\n\n\n\n')
        } else if (obj.path === 'another.js') {
          return content('\n\n@TODO Another one!\nsdfasd\nsdfas\n\n\n@todo One more issue!\ndsfsa\n\n\nsdfsdaf')
        }
      })
    },
    pullRequests: {
      getAll: jest.fn().mockReturnValue(Promise.resolve({ data: [{ head: { ref: 'master' }, number: 10 }] }))
    }
  }
  // Passes the mocked out GitHub API into out robot instance
  robot.auth = () => Promise.resolve(github)
  return { robot, github }
}

describe('todo', () => {
  it('returns the homepage on GET /', async () => {
    const {robot} = gimmeRobot()
    const app = robot.route()
    const res = await request(app).get('/')
    expect(res.text.startsWith('<!DOCTYPE html>')).toBe(true)
  })

  it('requests issues for the repo', async () => {
    const {robot, github} = gimmeRobot()
    await robot.receive(payloads.basic)
    expect(github.issues.getForRepo.mock.calls.length).toBe(1)
  })

  it('requests issues for the repo', async () => {
    const {robot, github} = gimmeRobot()
    await robot.receive(payloads.basic)
    expect(github.issues.getForRepo.mock.calls.length).toBe(1)
  })

  it('creates an issue', async () => {
    const {robot, github} = gimmeRobot()
    await robot.receive(payloads.basic)
    expect(github.issues.create.mock.calls.length).toBe(1)
    expect(github.issues.create).toBeCalledWith({
      body: fs.readFileSync(path.join(__dirname, 'fixtures', 'bodies', 'pr.txt'), 'utf8'),
      number: undefined,
      owner: 'JasonEtco',
      repo: 'test',
      title: 'Jason!',
      assignee: 'JasonEtco'
    })
  })

  it('creates an issue without assigning anyone', async () => {
    const {robot, github} = gimmeRobot('autoAssignFalse.yml')
    await robot.receive(payloads.basic)
    expect(github.issues.create).toBeCalledWith({
      body: fs.readFileSync(path.join(__dirname, 'fixtures', 'bodies', 'autoAssignFalse.txt'), 'utf8'),
      number: undefined,
      owner: 'JasonEtco',
      repo: 'test',
      title: 'Jason!'
    })
  })

  it('creates an issue and assigns the configured user', async () => {
    const {robot, github} = gimmeRobot('autoAssignString.yml')
    await robot.receive(payloads.basic)
    expect(github.issues.create).toBeCalledWith({
      body: fs.readFileSync(path.join(__dirname, 'fixtures', 'bodies', 'autoAssignString.txt'), 'utf8'),
      number: undefined,
      owner: 'JasonEtco',
      repo: 'test',
      title: 'Jason!',
      assignee: 'matchai'
    })
  })

  it('creates an issue and assigns the configured users', async () => {
    const {robot, github} = gimmeRobot('autoAssignArr.yml')
    await robot.receive(payloads.basic)
    expect(github.issues.create).toBeCalledWith({
      body: fs.readFileSync(path.join(__dirname, 'fixtures', 'bodies', 'autoAssignArr.txt'), 'utf8'),
      number: undefined,
      owner: 'JasonEtco',
      repo: 'test',
      title: 'Jason!',
      assignees: ['JasonEtco', 'matchai', 'defunkt']
    })
  })

  it('works with a complex push (with multiple commits)', async () => {
    const {robot, github} = gimmeRobot()
    await robot.receive(payloads.complex)
    expect(github.issues.create.mock.calls.length).toBe(3)
  })

  it('respects the capitalization config', async () => {
    const {robot, github} = gimmeRobot('caseSensitive.yml')
    await robot.receive(payloads.complex)
    expect(github.issues.create.mock.calls.length).toBe(1)
  })

  it('does not create any issues', async () => {
    const {robot, github} = gimmeRobot('caseSensitivePizza.yml')
    await robot.receive(payloads.complex)
    expect(github.issues.create.mock.calls.length).toBe(0)
  })

  it('does not create an issues that already exists', async () => {
    const {robot, github} = gimmeRobot('existing.yml')
    await robot.receive(payloads.complex)
    expect(github.issues.create.mock.calls.length).toBe(0)
  })
})
