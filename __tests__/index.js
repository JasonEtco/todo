const {createRobot} = require('probot')
const payloads = require('./fixtures/payloads')
const app = require('..')
const fs = require('fs')
const path = require('path')
const request = require('supertest')

function gimmeRobot (config = 'basic.yml', issues = [{ data: [{ title: 'An issue that exists', state: 'open' }] }]) {
  const cfg = config ? fs.readFileSync(path.join(__dirname, 'fixtures', 'configs', config), 'utf8') : config
  let robot
  let github
  const content = (str) => Promise.resolve({ data: { content: Buffer.from(str) } })

  robot = createRobot()
  app(robot)

  github = {
    issues: {
      getForRepo: jest.fn().mockReturnValue(Promise.resolve(issues)),
      create: jest.fn()
    },
    paginate: jest.fn().mockReturnValue(Promise.resolve(issues)),
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
  describe('GET /', () => {
    it('returns the homepage', async () => {
      const {robot} = gimmeRobot()
      const app = robot.route()
      const res = await request(app).get('/')
      expect(res.text.startsWith('<!DOCTYPE html>')).toBe(true)
    })

    it('responds with the proper caching header', async () => {
      const {robot} = gimmeRobot()
      const app = robot.route()
      const res = await request(app).get('/')
      expect(res.header).toHaveProperty('cache-control', 'public, max-age=1200, s-maxage=3200')
    })
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

  it('works without a config present', async () => {
    const {robot, github} = gimmeRobot(false)
    await robot.receive(payloads.basic)
    expect(github.issues.create.mock.calls.length).toBe(1)
  })

  it('creates 31 issues', async () => {
    const {robot, github} = gimmeRobot()
    await robot.receive(payloads.many)
    expect(github.issues.create.mock.calls.length).toBe(33)
  })

  it('paginates when there are over 30 issues', async () => {
    const issuesPageOne = Array.apply(null, Array(30)).map((v, i) => ({ title: `I do not exist ${i}`, state: 'open' }))
    const issuesPageTwo = Array.apply(null, Array(3)).map((v, i) => ({ title: `I do not exist ${i + 30}`, state: 'open' }))
    const {robot, github} = gimmeRobot('basic.yml', [{ data: issuesPageOne }, { data: issuesPageTwo }])
    await robot.receive(payloads.many)
    expect(github.issues.create.mock.calls.length).toBe(33)
  })

  it('paginates when there are over 30 issues and does not make them', async () => {
    const issuesPageOne = Array.apply(null, Array(30)).map((v, i) => ({ title: `I exist ${i}`, state: 'open' }))
    const issuesPageTwo = Array.apply(null, Array(2)).map((v, i) => ({ title: `I exist ${i + 30}`, state: 'open' }))
    const {robot, github} = gimmeRobot('basic.yml', [{ data: issuesPageOne }, { data: issuesPageTwo }])
    await robot.receive(payloads.many)
    expect(github.issues.create.mock.calls.length).toBe(1)
  })
})
