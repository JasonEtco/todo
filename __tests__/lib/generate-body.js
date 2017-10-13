const generateBody = require('../../lib/generate-body')
const payloads = require('../fixtures/payloads')
const fs = require('fs')
const path = require('path')

describe('generate-body', () => {
  let context

  const title = 'Jason!'
  const file = 'index.js'
  const contents = '\n\n@todo Jason!\nasdfas\nasdfdsafasd\nsd\nasdfsa\n\nsdfsadfsa'
  const contentsBody = '\n\n@todo Jason!\n@body This one has a body\nasdfas\nasdfdsafasd\nsd\nasdfsa\n\nsdfsadfsa'
  const author = payloads.basic.payload.pusher.name
  const sha = 'sha'

  beforeEach(() => {
    context = {
      repo: () => ({
        owner: payloads.basic.payload.repository.owner.login,
        repo: payloads.basic.payload.repository.name
      }),
      payload: {
        installation: {
          id: 10000
        }
      }
    }
  })

  it('generates a body string', () => {
    const config = { keyword: '@todo', blobLines: 2 }
    const body = generateBody(context, config, title, file, contents, author, sha)
    expect(body).toBe(fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'bodies', 'default.txt'), 'utf8'))
  })

  describe('autoAssign', () => {
    it('prepares a message with the committer', () => {
      const config = { keyword: '@todo', autoAssign: true, blobLines: 2 }
      const body = generateBody(context, config, title, file, contents, author, sha)
      expect(body).toBe(fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'bodies', 'default.txt'), 'utf8'))
    })

    it('prepares a message without an assignee', () => {
      const config = { keyword: '@todo', autoAssign: false, blobLines: 2 }
      const body = generateBody(context, config, title, file, contents, author, sha, 10)
      expect(body).toBe(fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'bodies', 'autoAssignFalse.txt'), 'utf8'))
    })

    it('prepares a message with the configured assignee', () => {
      const config = { keyword: '@todo', autoAssign: '@matchai', blobLines: 2 }
      const body = generateBody(context, config, title, file, contents, author, sha, 10)
      expect(body).toBe(fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'bodies', 'autoAssignString.txt'), 'utf8'))
    })

    it('prepares a message with the configured assignees', () => {
      const config = { keyword: '@todo', autoAssign: ['@JasonEtco', 'matchai', 'defunkt'], blobLines: 2 }
      const body = generateBody(context, config, title, file, contents, author, sha, 10)
      expect(body).toBe(fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'bodies', 'autoAssignArr.txt'), 'utf8'))
    })
  })

  it('generates a body string with a PR', () => {
    const config = { keyword: '@todo', blobLines: 5 }
    const body = generateBody(context, config, title, file, contents, author, sha, 10)
    expect(body).toBe(fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'bodies', 'pr.txt'), 'utf8'))
  })

  describe('blobLines', () => {
    it('generates a body string without a blob, blobLines: false', () => {
      const config = { keyword: '@todo', blobLines: false }
      const body = generateBody(context, config, title, file, contents, author, sha)
      expect(body).toBe(fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'bodies', 'no-blob.txt'), 'utf8'))
    })

    it('generates a body string without a blob, blobLines: 0', () => {
      const config = { keyword: '@todo', blobLines: 0 }
      const body = generateBody(context, config, title, file, contents, author, sha)
      expect(body).toBe(fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'bodies', 'no-blob.txt'), 'utf8'))
    })
  })

  it('generates a body string with a custom message', () => {
    const config = { keyword: '@todo', blobLines: 2 }
    const body = generateBody(context, config, title, file, contentsBody, author, sha)
    expect(body).toBe(fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'bodies', 'with-body.txt'), 'utf8'))
  })

  it('generates a body string with a custom message but no blob', () => {
    const config = { keyword: '@todo', blobLines: false }
    const body = generateBody(context, config, title, file, contentsBody, author, sha)
    expect(body).toBe(fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'bodies', 'with-body-no-blob.txt'), 'utf8'))
  })
})
