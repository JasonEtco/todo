const payloads = require('./fixtures/payloads')
const {gimmeRobot} = require('./helpers')
const fs = require('fs')
const path = require('path')

describe('languages', () => {
  const tree = [
    { path: 'go.go', sha: 'sha' },
    { path: 'ruby.rb', sha: 'sha' },
    { path: 'c.c', sha: 'sha' },
    { path: 'c-sharp.cs', sha: 'sha' }
  ]

  const expected = (title, language) => ({
    title,
    body: fs.readFileSync(path.join(__dirname, 'fixtures', 'bodies', `${language}.txt`), 'utf8'),
    number: undefined,
    labels: ['todo'],
    owner: 'JasonEtco',
    repo: 'test',
    assignee: 'JasonEtco'
  })

  it('works with Go', async () => {
    const {robot, github} = gimmeRobot('noBlob.yml', {data: {items: [], total_count: 0}}, tree)
    const p = payloads.basic
    p.payload.commits[0].modified = ['go.go']

    await robot.receive(p)
    expect(github.issues.create).toHaveBeenCalledTimes(1)
    expect(github.issues.create).toBeCalledWith(expected('Check that Go works', 'go'))
  })

  it('works with Ruby', async () => {
    const {robot, github} = gimmeRobot('noBlob.yml', {data: {items: [], total_count: 0}}, tree)

    const p = payloads.basic
    p.payload.commits[0].modified = ['ruby.rb']

    await robot.receive(p)
    expect(github.issues.create).toHaveBeenCalledTimes(1)
    expect(github.issues.create).toBeCalledWith(expected('Check that Ruby works', 'ruby'))
  })

  it('works with C#', async () => {
    const {robot, github} = gimmeRobot('noBlob.yml', {data: {items: [], total_count: 0}}, tree)

    const p = payloads.basic
    p.payload.commits[0].modified = ['c-sharp.cs']

    await robot.receive(p)
    expect(github.issues.create).toHaveBeenCalledTimes(1)
    expect(github.issues.create).toBeCalledWith(expected('Check that C# works', 'c-sharp'))
  })

  it('works with C', async () => {
    const {robot, github} = gimmeRobot('noBlob.yml', {data: {items: [], total_count: 0}}, tree)

    const p = payloads.basic
    p.payload.commits[0].modified = ['c.c']

    await robot.receive(p)
    expect(github.issues.create).toHaveBeenCalledTimes(1)
    expect(github.issues.create).toBeCalledWith(expected('Check that C works', 'c'))
  })
})
