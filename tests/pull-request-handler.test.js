const nock = require('nock')
const { Probot, ProbotOctokit } = require('probot')

const { loadConfig, loadDiff } = require('./helpers')
const pullRequestOpened = require('./fixtures/payloads/pull_request.opened.json')
const plugin = require('..')

describe('pull-request-handler', () => {
  let probot
  const event = { name: 'pull_request', payload: pullRequestOpened }

  beforeEach(() => {
    probot = new Probot({
      id: 1,
      githubToken: 'secret',
      Octokit: ProbotOctokit.defaults({
        retry: { enabled: false },
        throttle: { enabled: false }
      })
    })
    probot.load(plugin)
  })

  it('comments on a pull request', async () => {
    const mock = nock('https://api.github.com')

      .get('/repos/JasonEtco/tests/issues/32/comments')
      .reply(200, [])

      .head('/repos/JasonEtco/tests/pulls/32')
      .reply(200)

      .get('/repos/JasonEtco/tests/pulls/32')
      .matchHeader('accept', 'application/vnd.github.diff')
      .reply(200, loadDiff('basic'))

      .get('/repos/JasonEtco/tests/contents/.github%2Fconfig.yml')
      .reply(404, {})
      .get('/repos/JasonEtco/.github/contents/.github%2Fconfig.yml')
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
    const mock = nock('https://api.github.com')

      .get('/repos/JasonEtco/tests/issues/32/comments')
      .reply(200, [])

      .head('/repos/JasonEtco/tests/pulls/32')
      .reply(200)

      .get('/repos/JasonEtco/tests/pulls/32')
      .matchHeader('accept', 'application/vnd.github.diff')
      .reply(200, loadDiff('basic'))

      .get('/repos/JasonEtco/tests/contents/.github%2Fconfig.yml')
      .reply(200, {
        content: loadConfig('autoAssignString')
      })

      .post('/repos/JasonEtco/tests/issues/32/comments', parameters => {
        expect(parameters).toMatchSnapshot()

        return true
      })
      .reply(201, {})

    await probot.receive(event)
    expect(mock.activeMocks()).toStrictEqual([])
  })

  it('comments on a pull request and mentions the assigned users', async () => {
    const mock = nock('https://api.github.com')

      .get('/repos/JasonEtco/tests/issues/32/comments')
      .reply(200, [])

      .head('/repos/JasonEtco/tests/pulls/32')
      .reply(200)

      .get('/repos/JasonEtco/tests/pulls/32')
      .matchHeader('accept', 'application/vnd.github.diff')
      .reply(200, loadDiff('basic'))

      .get('/repos/JasonEtco/tests/contents/.github%2Fconfig.yml')
      .reply(200, {
        content: loadConfig('autoAssignArr')
      })

      .post('/repos/JasonEtco/tests/issues/32/comments', parameters => {
        expect(parameters).toMatchSnapshot()

        return true
      })
      .reply(201, {})

    await probot.receive(event)
    expect(mock.activeMocks()).toStrictEqual([])
  })

  it('does not create duplicate comments', async () => {
    const mock = nock('https://api.github.com')

      .get('/repos/JasonEtco/tests/issues/32/comments')
      .reply(200, [{
        body: '## I am an example title'
      }])

      .head('/repos/JasonEtco/tests/pulls/32')
      .reply(200)

      .get('/repos/JasonEtco/tests/pulls/32')
      .matchHeader('accept', 'application/vnd.github.diff')
      .reply(200, loadDiff('basic'))

      .get('/repos/JasonEtco/tests/contents/.github%2Fconfig.yml')
      .reply(200, {
        content: loadConfig('autoAssignArr')
      })

    await probot.receive(event)
    expect(mock.activeMocks()).toStrictEqual([])
  })

  it('creates many (5) comments', async () => {
    const mock = nock('https://api.github.com')

      .get('/repos/JasonEtco/tests/issues/32/comments')
      .reply(200, [])

      .head('/repos/JasonEtco/tests/pulls/32')
      .reply(200)

      .get('/repos/JasonEtco/tests/pulls/32')
      .matchHeader('accept', 'application/vnd.github.diff')
      .reply(200, loadDiff('many'))

      .get('/repos/JasonEtco/tests/contents/.github%2Fconfig.yml')
      .reply(404, {})
      .get('/repos/JasonEtco/.github/contents/.github%2Fconfig.yml')
      .reply(404, {})

      .post('/repos/JasonEtco/tests/issues/32/comments', parameters => {
        expect(parameters).toMatchSnapshot()

        return true
      })
      .times(5)
      .reply(201, {})

    await probot.receive(event)
    expect(mock.activeMocks()).toStrictEqual([])
  })

  it('ignores changes to the config file', async () => {
    const mock = nock('https://api.github.com')

      .get('/repos/JasonEtco/tests/issues/32/comments')
      .reply(200, [])

      .head('/repos/JasonEtco/tests/pulls/32')
      .reply(200)

      .get('/repos/JasonEtco/tests/pulls/32')
      .matchHeader('accept', 'application/vnd.github.diff')
      .reply(200, loadDiff('config'))

      .get('/repos/JasonEtco/tests/contents/.github%2Fconfig.yml')
      .reply(404, {})
      .get('/repos/JasonEtco/.github/contents/.github%2Fconfig.yml')
      .reply(404, {})

    await probot.receive(event)
    expect(mock.activeMocks()).toStrictEqual([])
  })

  it('ignores changes to the bin directory', async () => {
    const mock = nock('https://api.github.com')

      .get('/repos/JasonEtco/tests/issues/32/comments')
      .reply(200, [])

      .head('/repos/JasonEtco/tests/pulls/32')
      .reply(200)

      .get('/repos/JasonEtco/tests/pulls/32')
      .matchHeader('accept', 'application/vnd.github.diff')
      .reply(200, loadDiff('bin'))

      .get('/repos/JasonEtco/tests/contents/.github%2Fconfig.yml')
      .reply(200, {
        content: loadConfig('excludeBin')
      })

    await probot.receive(event)
    expect(mock.activeMocks()).toStrictEqual([])
  })

  it('works with a string as the keyword config', async () => {
    const mock = nock('https://api.github.com')

      .get('/repos/JasonEtco/tests/issues/32/comments')
      .reply(200, [])

      .head('/repos/JasonEtco/tests/pulls/32')
      .reply(200)

      .get('/repos/JasonEtco/tests/pulls/32')
      .matchHeader('accept', 'application/vnd.github.diff')
      .reply(200, loadDiff('custom-keyword'))

      .get('/repos/JasonEtco/tests/contents/.github%2Fconfig.yml')
      .reply(200, {
        content: loadConfig('keywordsString')
      })

      .post('/repos/JasonEtco/tests/issues/32/comments', parameters => {
        expect(parameters).toMatchSnapshot()

        return true
      })
      .reply(201, {})

    await probot.receive(event)
    expect(mock.activeMocks()).toStrictEqual([])
  })

  it('creates a comment with a body line', async () => {
    const mock = nock('https://api.github.com')

      .get('/repos/JasonEtco/tests/issues/32/comments')
      .reply(200, [])

      .head('/repos/JasonEtco/tests/pulls/32')
      .reply(200)

      .get('/repos/JasonEtco/tests/pulls/32')
      .matchHeader('accept', 'application/vnd.github.diff')
      .reply(200, loadDiff('body'))

      .get('/repos/JasonEtco/tests/contents/.github%2Fconfig.yml')
      .reply(404, {})
      .get('/repos/JasonEtco/.github/contents/.github%2Fconfig.yml')
      .reply(404, {})

      .post('/repos/JasonEtco/tests/issues/32/comments', parameters => {
        expect(parameters).toMatchSnapshot()

        return true
      })
      .reply(201, {})

    await probot.receive(event)
    expect(mock.activeMocks()).toStrictEqual([])
  })
})
