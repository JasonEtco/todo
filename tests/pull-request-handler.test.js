const nock = require('nock')
const { Probot } = require('probot')

const { gimmeApp, loadConfig, loadDiff } = require('./helpers')
const pullRequestOpened = require('./fixtures/payloads/pull_request.opened.json')
const plugin = require('..')

describe('pull-request-handler', () => {
  let probot
  const event = { name: 'pull_request', payload: pullRequestOpened }

  beforeEach(() => {
    probot = new Probot({
      id: 1,
      githubToken: 'secret',
      throttleOptions: {
        enabled: false
      }
    })
    probot.load(plugin)
  })

  it.only('comments on a pull request', async () => {
    const mock = nock('https://api.github.com')
    
      .get('/repos/JasonEtco/tests/issues/32/comments')
      .reply(200, [])

      .head('/repos/JasonEtco/tests/pulls/32')
      .reply(200)

      .get('/repos/JasonEtco/tests/pulls/32')
      .matchHeader('accept', 'application/vnd.github.diff')
      .reply(200, (await loadDiff('basic')).data)

      .get('/repos/JasonEtco/tests/contents/.github/config.yml')
      .reply(404, {})
      .get('/repos/JasonEtco/.github/contents/.github/config.yml')
      .reply(404, {})

      .post('/repos/JasonEtco/tests/issues/32/comments', parameters => {
        expect(parameters).toMatchSnapshot()

        return true
      })
      .reply(201, {})

    await probot.receive(event)
    expect(mock.activeMocks()).toStrictEqual([])
  })

  it('comments on a pull request and mentions the assigned user', async () => {
    github.repos.getContents.mockReturnValueOnce(loadConfig('autoAssignString'))
    await app.receive(event)
    expect(github.issues.createComment.mock.calls[0]).toMatchSnapshot()
  })

  it('comments on a pull request and mentions the assigned users', async () => {
    github.repos.getContents.mockReturnValueOnce(loadConfig('autoAssignArr'))
    await app.receive(event)
    expect(github.issues.createComment.mock.calls[0]).toMatchSnapshot()
  })

  it('does not create duplicate comments', async () => {
    github.issues.listComments.mockReturnValueOnce(Promise.resolve({
      data: [{
        body: '## I am an example title'
      }]
    }))

    await app.receive(event)
    expect(github.issues.createComment).not.toHaveBeenCalled()
  })

  it('creates many (5) comments', async () => {
    github.pulls.get.mockReturnValue(loadDiff('many'))
    await app.receive(event)
    expect(github.issues.createComment).toHaveBeenCalledTimes(5)
  })

  it('ignores changes to the config file', async () => {
    github.pulls.get.mockReturnValue(loadDiff('config'))
    await app.receive(event)
    expect(github.issues.createComment).not.toHaveBeenCalled()
  })

  it('ignores changes to the bin directory', async () => {
    github.pulls.get.mockReturnValue(loadDiff('bin'))
    github.repos.getContents.mockReturnValueOnce(loadConfig('excludeBin'))
    await app.receive(event)
    expect(github.issues.createComment).not.toHaveBeenCalled()
  })

  it('works with a string as the keyword config', async () => {
    github.repos.getContents.mockReturnValueOnce(loadConfig('keywordsString'))
    github.pulls.get.mockReturnValue(loadDiff('custom-keyword'))
    await app.receive(event)
    expect(github.issues.createComment.mock.calls[0]).toMatchSnapshot()
  })

  it('creates a comment with a body line', async () => {
    github.pulls.get.mockReturnValue(loadDiff('body'))
    await app.receive(event)
    expect(github.issues.createComment.mock.calls[0]).toMatchSnapshot()
  })
})
