const {createRobot} = require('probot')
const payloads = require('./fixtures/payloads')
const app = require('..')
const fs = require('fs')
const path = require('path')

function gimmeRobot () {
  const cfg = fs.readFileSync(path.join(__dirname, 'fixtures', 'configs', 'noBlob.yml'), 'utf8')
  let robot
  let github
  const content = (str) => Promise.resolve({ data: { content: Buffer.from(str) } })

  robot = createRobot()
  app(robot)

  github = {
    issues: {
      getForRepo: jest.fn().mockReturnValue(Promise.resolve([])),
      create: jest.fn(),
      createLabel: jest.fn()
    },
    search: {
      issues: jest.fn().mockReturnValue(Promise.resolve([{data: {items: [], total_count: 0}}]))
    },
    paginate: jest.fn().mockReturnValue(Promise.resolve([])),
    repos: {
      getContent: jest.fn((obj) => {
        if (obj.path.includes('config.yml')) {
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

describe('languages', () => {
  const expected = (language, title) => ({
    title,
    body: fs.readFileSync(path.join(__dirname, 'fixtures', 'bodies', `${language}.txt`), 'utf8'),
    number: undefined,
    labels: ['todo'],
    owner: 'JasonEtco',
    repo: 'test',
    assignee: 'JasonEtco'
  })

  it('works with Go', async () => {
    const p = payloads.basic
    p.payload.commits[0].modified = ['go.go']

    const {robot, github} = gimmeRobot()
    await robot.receive(payloads.basic)
    expect(github.issues.create.mock.calls.length).toBe(1)
    expect(github.issues.create).toBeCalledWith(expected('go', 'Check that Go works'))
  })

  it('works with Ruby', async () => {
    const p = payloads.basic
    p.payload.commits[0].modified = ['ruby.rb']

    const {robot, github} = gimmeRobot()
    await robot.receive(payloads.basic)
    expect(github.issues.create.mock.calls.length).toBe(1)
    expect(github.issues.create).toBeCalledWith(expected('ruby', 'Check that Ruby works'))
  })

  it('works with C#', async () => {
    const p = payloads.basic
    p.payload.commits[0].modified = ['c-sharp.cs']

    const {robot, github} = gimmeRobot()
    await robot.receive(payloads.basic)
    expect(github.issues.create.mock.calls.length).toBe(1)
    expect(github.issues.create).toBeCalledWith(expected('c-sharp', 'Check that C# works'))
  })

  it('works with C', async () => {
    const p = payloads.basic
    p.payload.commits[0].modified = ['c.c']

    const {robot, github} = gimmeRobot()
    await robot.receive(payloads.basic)
    expect(github.issues.create.mock.calls.length).toBe(1)
    expect(github.issues.create).toBeCalledWith(expected('c', 'Check that C works'))
  })
})
