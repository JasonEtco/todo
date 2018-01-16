const payloads = require('./fixtures/payloads')
const {gimmeRobot} = require('./helpers')

describe('languages', () => {
  const tree = [
    { path: 'go.go', sha: 'sha' },
    { path: 'ruby.rb', sha: 'sha' },
    { path: 'c.c', sha: 'sha' },
    { path: 'c-sharp.cs', sha: 'sha' },
    { path: 'bash.sh', sha: 'sha' },
    { path: 'python.py', sha: 'sha' }
  ]

  let robot, github

  beforeEach(() => {
    const given = gimmeRobot('noBlob.yml', {data: {items: [], total_count: 0}}, tree)
    robot = given.robot
    github = given.github
  })

  it('works with Go', async () => {
    payloads.basic.payload.commits[0].modified = ['go.go']

    await robot.receive(payloads.basic)
    expect(github.issues.create).toHaveBeenCalledTimes(1)
    expect(github.issues.create.mock.calls[0]).toMatchSnapshot()
  })

  it('works with Ruby', async () => {
    payloads.basic.payload.commits[0].modified = ['ruby.rb']

    await robot.receive(payloads.basic)
    expect(github.issues.create).toHaveBeenCalledTimes(1)
    expect(github.issues.create.mock.calls[0]).toMatchSnapshot()
  })

  it('works with C#', async () => {
    payloads.basic.payload.commits[0].modified = ['c-sharp.cs']

    await robot.receive(payloads.basic)
    expect(github.issues.create).toHaveBeenCalledTimes(1)
    expect(github.issues.create.mock.calls[0]).toMatchSnapshot()
  })

  it('works with C', async () => {
    payloads.basic.payload.commits[0].modified = ['c.c']

    await robot.receive(payloads.basic)
    expect(github.issues.create).toHaveBeenCalledTimes(1)
    expect(github.issues.create.mock.calls[0]).toMatchSnapshot()
  })

  it('works with Bash', async () => {
    payloads.basic.payload.commits[0].modified = ['bash.sh']

    await robot.receive(payloads.basic)
    expect(github.issues.create).toHaveBeenCalledTimes(1)
    expect(github.issues.create.mock.calls[0]).toMatchSnapshot()
  })

  it('works with Python', async () => {
    payloads.basic.payload.commits[0].modified = ['python.py']

    await robot.receive(payloads.basic)
    expect(github.issues.create).toHaveBeenCalledTimes(1)
    expect(github.issues.create.mock.calls[0]).toMatchSnapshot()
  })
})
