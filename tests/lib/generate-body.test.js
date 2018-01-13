const generateBody = require('../../lib/generate-body')
const payloads = require('../fixtures/payloads')

describe('generate-body', () => {
  let context

  const title = 'Jason!'
  const file = 'index.js'
  const contents = '\n\n@todo Jason!\nasdfas\nasdfdsafasd\nsd\nasdfsa\n\nsdfsadfsa'
  const contentsBody = '\n\n@todo Jason!\n@body This one has a body\nasdfas\nasdfdsafasd\nsd\nasdfsa\n\nsdfsadfsa'
  const author = payloads.basic.payload.pusher.name
  const sha = payloads.basic.payload.head_commit.id

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
    const config = { keyword: '@todo', bodyKeyword: '@body', blobLines: 5 }
    const body = generateBody(context, config, title, file, contents, author, sha)
    expect(body).toMatchSnapshot()
  })

  describe('autoAssign', () => {
    it('prepares a message with the committer', () => {
      const config = { keyword: '@todo', bodyKeyword: '@body', autoAssign: true, blobLines: 5 }
      const body = generateBody(context, config, title, file, contents, author, sha)
      expect(body).toMatchSnapshot()
    })

    it('prepares a message without an assignee', () => {
      const config = { keyword: '@todo', bodyKeyword: '@body', autoAssign: false, blobLines: 5 }
      const body = generateBody(context, config, title, file, contents, author, sha)
      expect(body).toMatchSnapshot()
    })

    it('prepares a message with the configured assignee', () => {
      const config = { keyword: '@todo', bodyKeyword: '@body', autoAssign: '@matchai', blobLines: 5 }
      const body = generateBody(context, config, title, file, contents, author, sha)
      expect(body).toMatchSnapshot()
    })

    it('prepares a message with the configured assignees', () => {
      const config = { keyword: '@todo', bodyKeyword: '@body', autoAssign: ['@JasonEtco', 'matchai', 'defunkt'], blobLines: 5 }
      const body = generateBody(context, config, title, file, contents, author, sha)
      expect(body).toMatchSnapshot()
    })
  })

  it('generates a body string with a PR', () => {
    const config = { keyword: '@todo', bodyKeyword: '@body', blobLines: 5 }
    const body = generateBody(context, config, title, file, contents, author, sha, 10)
    expect(body).toMatchSnapshot()
  })

  describe('blobLines', () => {
    it('generates a body string without a blob, blobLines: false', () => {
      const config = { keyword: '@todo', bodyKeyword: '@body', blobLines: false }
      const body = generateBody(context, config, title, file, contents, author, sha)
      expect(body).toMatchSnapshot()
    })

    it('generates a body string without a blob, blobLines: 0', () => {
      const config = { keyword: '@todo', bodyKeyword: '@body', blobLines: 0 }
      const body = generateBody(context, config, title, file, contents, author, sha)
      expect(body).toMatchSnapshot()
    })
  })

  it('generates a body string with a custom message', () => {
    const config = { keyword: '@todo', bodyKeyword: '@body', blobLines: 5 }
    const body = generateBody(context, config, title, file, contentsBody, author, sha)
    expect(body).toMatchSnapshot()
  })

  it('generates a body string with a custom message but no blob', () => {
    const config = { keyword: '@todo', bodyKeyword: '@body', blobLines: false }
    const body = generateBody(context, config, title, file, contentsBody, author, sha)
    expect(body).toMatchSnapshot()
  })

  it('respects the configured bodyKeyword', () => {
    const config = { keyword: '@todo', bodyKeyword: '@pizza', blobLines: 5 }
    const contentsPizza = '\n\n@todo Jason!\n@pizza This one has a body\n@body eat some pizza\nasdfas\nasdfdsafasd\nsd\nasdfsa\n\nsdfsadfsa'
    const body = generateBody(context, config, title, file, contentsPizza, author, sha)
    expect(body).toMatchSnapshot()
  })
})
