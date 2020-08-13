const nock = require('nock')
const { Probot, ProbotOctokit } = require('probot')

const { loadConfig, loadDiff } = require('./helpers')
const pullRequestClosed = require('./fixtures/payloads/pull_request.closed.json')
const plugin = require('..')

describe('pull-request-merged-handler', () => {
  let probot
  const event = { name: 'pull_request', payload: pullRequestClosed }

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

  it('does nothing on an unmerged, closed PR', async () => {
    await probot.receive({
      ...event,
      payload: {
        ...event.payload,
        pull_request: { merged: false }
      }
    })
  })

  it('creates an issue', async () => {
    const mock = nock('https://api.github.com')
      .head('/repos/JasonEtco/tests/pulls/21')
      .reply(200)

      .get('/search/issues')
      .query(true)
      .reply(200, {
        items: []
      })

      .get('/repos/JasonEtco/tests/pulls/21')
      .matchHeader('accept', 'application/vnd.github.diff')
      .reply(200, loadDiff('basic'))

      .get('/repos/JasonEtco/tests/contents/.github%2Fconfig.yml')
      .reply(404, {})
      .get('/repos/JasonEtco/.github/contents/.github%2Fconfig.yml')
      .reply(404, {})

      .post('/repos/JasonEtco/tests/issues', (parameters) => {
        expect(parameters).toMatchSnapshot()

        return true
      })
      .reply(201, {})

    await probot.receive(event)
    expect(mock.activeMocks()).toStrictEqual([])
  })

  it('creates an issue with a truncated title', async () => {
    const mock = nock('https://api.github.com')
      .head('/repos/JasonEtco/tests/pulls/21')
      .reply(200)

      .get('/search/issues')
      .query(true)
      .reply(200, {
        items: []
      })

      .get('/repos/JasonEtco/tests/pulls/21')
      .matchHeader('accept', 'application/vnd.github.diff')
      .reply(200, loadDiff('long-title'))

      .get('/repos/JasonEtco/tests/contents/.github%2Fconfig.yml')
      .reply(404, {})
      .get('/repos/JasonEtco/.github/contents/.github%2Fconfig.yml')
      .reply(404, {})

      .post('/repos/JasonEtco/tests/issues', (parameters) => {
        expect(parameters).toMatchSnapshot()

        return true
      })
      .reply(201, {})

    await probot.receive(event)
    expect(mock.activeMocks()).toStrictEqual([])
  })

  it('creates an issue without assigning anyone', async () => {
    const mock = nock('https://api.github.com')
      .head('/repos/JasonEtco/tests/pulls/21')
      .reply(200)

      .get('/search/issues')
      .query(true)
      .reply(200, {
        items: []
      })

      .get('/repos/JasonEtco/tests/pulls/21')
      .matchHeader('accept', 'application/vnd.github.diff')
      .reply(200, loadDiff('basic'))

      .get('/repos/JasonEtco/tests/contents/.github%2Fconfig.yml')
      .reply(200, {
        content: loadConfig('autoAssignFalse')
      })

      .post('/repos/JasonEtco/tests/issues', (parameters) => {
        expect(parameters).toMatchSnapshot()

        return true
      })
      .reply(201, {})

    await probot.receive(event)
    expect(mock.activeMocks()).toStrictEqual([])
  })

  it('creates an issue and assigns the configured user', async () => {
    const mock = nock('https://api.github.com')
      .head('/repos/JasonEtco/tests/pulls/21')
      .reply(200)

      .get('/search/issues')
      .query(true)
      .reply(200, {
        items: []
      })

      .get('/repos/JasonEtco/tests/pulls/21')
      .matchHeader('accept', 'application/vnd.github.diff')
      .reply(200, loadDiff('basic'))

      .get('/repos/JasonEtco/tests/contents/.github%2Fconfig.yml')
      .reply(200, {
        content: loadConfig('autoAssignString')
      })

      .post('/repos/JasonEtco/tests/issues', (parameters) => {
        expect(parameters).toMatchSnapshot()

        return true
      })
      .reply(201, {})

    await probot.receive(event)
    expect(mock.activeMocks()).toStrictEqual([])
  })

  it('creates an issue and assigns the configured users', async () => {
    const mock = nock('https://api.github.com')
      .head('/repos/JasonEtco/tests/pulls/21')
      .reply(200)

      .get('/search/issues')
      .query(true)
      .reply(200, {
        items: []
      })

      .get('/repos/JasonEtco/tests/pulls/21')
      .matchHeader('accept', 'application/vnd.github.diff')
      .reply(200, loadDiff('basic'))

      .get('/repos/JasonEtco/tests/contents/.github%2Fconfig.yml')
      .reply(200, {
        content: loadConfig('autoAssignArr')
      })

      .post('/repos/JasonEtco/tests/issues', (parameters) => {
        expect(parameters).toMatchSnapshot()

        return true
      })
      .reply(201, {})

    await probot.receive(event)
    expect(mock.activeMocks()).toStrictEqual([])
  })

  it('does not create any issues if no todos are found', async () => {
    const mock = nock('https://api.github.com')
      .head('/repos/JasonEtco/tests/pulls/21')
      .reply(200)

      .get('/repos/JasonEtco/tests/pulls/21')
      .matchHeader('accept', 'application/vnd.github.diff')
      .reply(200, loadDiff('none'))

      .get('/repos/JasonEtco/tests/contents/.github%2Fconfig.yml')
      .reply(404, {})
      .get('/repos/JasonEtco/.github/contents/.github%2Fconfig.yml')
      .reply(404, {})

    await probot.receive(event)
    expect(mock.activeMocks()).toStrictEqual([])
  })

  it('does not create an issue that already exists', async () => {
    const mock = nock('https://api.github.com')
      .head('/repos/JasonEtco/tests/pulls/21')
      .reply(200)

      .get('/search/issues')
      .query(true)
      .reply(200, {
        items: [{ title: 'I am an example title', state: 'open' }]
      })

      .get('/repos/JasonEtco/tests/pulls/21')
      .matchHeader('accept', 'application/vnd.github.diff')
      .reply(200, loadDiff('basic'))

      .get('/repos/JasonEtco/tests/contents/.github%2Fconfig.yml')
      .reply(404, {})
      .get('/repos/JasonEtco/.github/contents/.github%2Fconfig.yml')
      .reply(404, {})

    await probot.receive(event)
    expect(mock.activeMocks()).toStrictEqual([])
  })

  it('creates many (5) issues', async () => {
    const mock = nock('https://api.github.com')
      .head('/repos/JasonEtco/tests/pulls/21')
      .reply(200)

      .get('/search/issues')
      .query(true)
      .times(5)
      .reply(200, {
        items: []
      })

      .get('/repos/JasonEtco/tests/pulls/21')
      .matchHeader('accept', 'application/vnd.github.diff')
      .reply(200, loadDiff('many'))

      .get('/repos/JasonEtco/tests/contents/.github%2Fconfig.yml')
      .reply(404, {})
      .get('/repos/JasonEtco/.github/contents/.github%2Fconfig.yml')
      .reply(404, {})

      .post('/repos/JasonEtco/tests/issues', (parameters) => {
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
      .head('/repos/JasonEtco/tests/pulls/21')
      .reply(200)

      .get('/repos/JasonEtco/tests/pulls/21')
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
      .head('/repos/JasonEtco/tests/pulls/21')
      .reply(200)

      .get('/repos/JasonEtco/tests/pulls/21')
      .matchHeader('accept', 'application/vnd.github.diff')
      .reply(200, loadDiff('bin'))

      .get('/repos/JasonEtco/tests/contents/.github%2Fconfig.yml')
      .reply(200, {
        content: loadConfig('excludeBin')
      })

    await probot.receive(event)
    expect(mock.activeMocks()).toStrictEqual([])
  })

  it('creates an issue with a body line', async () => {
    const mock = nock('https://api.github.com')
      .head('/repos/JasonEtco/tests/pulls/21')
      .reply(200)

      .get('/search/issues')
      .query(true)
      .reply(200, {
        items: []
      })

      .get('/repos/JasonEtco/tests/pulls/21')
      .matchHeader('accept', 'application/vnd.github.diff')
      .reply(200, loadDiff('body'))

      .get('/repos/JasonEtco/tests/contents/.github%2Fconfig.yml')
      .reply(404, {})
      .get('/repos/JasonEtco/.github/contents/.github%2Fconfig.yml')
      .reply(404, {})

      .post('/repos/JasonEtco/tests/issues', (parameters) => {
        expect(parameters).toMatchSnapshot()

        return true
      })
      .reply(201, {})

    await probot.receive(event)
    expect(mock.activeMocks()).toStrictEqual([])
  })

  it('reopens a closed issue', async () => {
    const mock = nock('https://api.github.com')
      .head('/repos/JasonEtco/tests/pulls/21')
      .reply(200)

      .get('/search/issues')
      .query(true)
      .reply(200, {
        items: [{ number: 1, title: 'I am an example title', state: 'closed' }]
      })

      .get('/repos/JasonEtco/tests/pulls/21')
      .matchHeader('accept', 'application/vnd.github.diff')
      .reply(200, loadDiff('basic'))

      .get('/repos/JasonEtco/tests/contents/.github%2Fconfig.yml')
      .reply(404, {})
      .get('/repos/JasonEtco/.github/contents/.github%2Fconfig.yml')
      .reply(404, {})

      .patch('/repos/JasonEtco/tests/issues/1', (parameters) => {
        expect(parameters).toMatchSnapshot()

        return true
      })
      .reply(201, {})

      .post('/repos/JasonEtco/tests/issues/1/comments', (parameters) => {
        expect(parameters).toMatchSnapshot()

        return true
      })
      .reply(201, {})

    await probot.receive(event)
    expect(mock.activeMocks()).toStrictEqual([])
  })

  it('respects the reopenClosed config', async () => {
    const mock = nock('https://api.github.com')
      .head('/repos/JasonEtco/tests/pulls/21')
      .reply(200)

      .get('/search/issues')
      .query(true)
      .reply(200, {
        items: [{ title: 'I am an example title', state: 'closed' }]
      })

      .get('/repos/JasonEtco/tests/pulls/21')
      .matchHeader('accept', 'application/vnd.github.diff')
      .reply(200, loadDiff('basic'))

      .get('/repos/JasonEtco/tests/contents/.github%2Fconfig.yml')
      .reply(200, {
        content: loadConfig('reopenClosedFalse')
      })

    await probot.receive(event)
    expect(mock.activeMocks()).toStrictEqual([])
  })
})
