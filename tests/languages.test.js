const payloads = require('./fixtures/payloads')
const {gimmeRobot} = require('./helpers')

describe('languages', () => {
  const tree = [
    { path: 'go.go', sha: 'sha' },
    { path: 'ruby.rb', sha: 'sha' },
    { path: 'c.c', sha: 'sha' },
    { path: 'c-sharp.cs', sha: 'sha' }
  ]

  it('works with Go', async () => {
    const {robot, github} = gimmeRobot('noBlob.yml', {data: {items: [], total_count: 0}}, tree)
    const p = payloads.basic
    p.payload.commits[0].modified = ['go.go']

    await robot.receive(p)
    expect(github.issues.create).toHaveBeenCalledTimes(1)
    expect(github.issues.create.mock.calls[0]).toMatchSnapshot()
  })

  it('works with Ruby', async () => {
    const {robot, github} = gimmeRobot('noBlob.yml', {data: {items: [], total_count: 0}}, tree)

    const p = payloads.basic
    p.payload.commits[0].modified = ['ruby.rb']

    await robot.receive(p)
    expect(github.issues.create).toHaveBeenCalledTimes(1)
    expect(github.issues.create.mock.calls[0]).toMatchSnapshot()
  })

  it('works with C#', async () => {
    const {robot, github} = gimmeRobot('noBlob.yml', {data: {items: [], total_count: 0}}, tree)

    const p = payloads.basic
    p.payload.commits[0].modified = ['c-sharp.cs']

    await robot.receive(p)
    expect(github.issues.create).toHaveBeenCalledTimes(1)
    expect(github.issues.create.mock.calls[0]).toMatchSnapshot()
  })

  it('works with C', async () => {
    const {robot, github} = gimmeRobot('noBlob.yml', {data: {items: [], total_count: 0}}, tree)

    const p = payloads.basic
    p.payload.commits[0].modified = ['c.c']

    await robot.receive(p)
    expect(github.issues.create).toHaveBeenCalledTimes(1)
    expect(github.issues.create.mock.calls[0]).toMatchSnapshot()
  })
})
