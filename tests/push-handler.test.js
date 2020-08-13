const nock = require('nock')
const { Probot } = require('probot')

const { loadConfig, loadDiff } = require('./helpers')
const pushEvent = require('./fixtures/payloads/push.json')
const plugin = require('..')

describe('push-handler', () => {
  let probot
  const event = { name: 'push', payload: pushEvent }

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

  it('creates an issue', async () => {
    const mock = nock('https://api.github.com')

      .get('/repos/JasonEtco/tests/git/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200, {
        parents: []
      })

      .head('/repos/JasonEtco/tests/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200)

      .get('/repos/JasonEtco/tests/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200, loadDiff('basic'))

      .get('/search/issues')
      .query(true)
      .reply(200, {
        items: []
      })

      .get('/repos/JasonEtco/tests/contents/.github/config.yml')
      .reply(404, {})
      .get('/repos/JasonEtco/.github/contents/.github/config.yml')
      .reply(404, {})

      .post('/repos/JasonEtco/tests/issues', parameters => {
        expect(parameters).toMatchSnapshot()

        return true
      })
      .reply(201, {})

    await probot.receive(event)
    expect(mock.activeMocks()).toStrictEqual([])
  })

  it('creates an issue with an @todo comment', async () => {
    const mock = nock('https://api.github.com')

      .get('/repos/JasonEtco/tests/git/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200, {
        parents: []
      })

      .head('/repos/JasonEtco/tests/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200)

      .get('/repos/JasonEtco/tests/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200, loadDiff('at-todo'))

      .get('/search/issues')
      .query(true)
      .reply(200, {
        items: []
      })

      .get('/repos/JasonEtco/tests/contents/.github/config.yml')
      .reply(404, {})
      .get('/repos/JasonEtco/.github/contents/.github/config.yml')
      .reply(404, {})

      .post('/repos/JasonEtco/tests/issues', parameters => {
        expect(parameters).toMatchSnapshot()

        return true
      })
      .reply(201, {})

    await probot.receive(event)
    expect(mock.activeMocks()).toStrictEqual([])
  })

  it('creates an issue with a truncated title', async () => {
    const mock = nock('https://api.github.com')

      .get('/repos/JasonEtco/tests/git/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200, {
        parents: []
      })

      .head('/repos/JasonEtco/tests/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200)

      .get('/repos/JasonEtco/tests/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200, loadDiff('long-title'))

      .get('/search/issues')
      .query(true)
      .reply(200, {
        items: []
      })

      .get('/repos/JasonEtco/tests/contents/.github/config.yml')
      .reply(404, {})
      .get('/repos/JasonEtco/.github/contents/.github/config.yml')
      .reply(404, {})

      .post('/repos/JasonEtco/tests/issues', parameters => {
        expect(parameters).toMatchSnapshot()

        return true
      })
      .reply(201, {})

    await probot.receive(event)
    expect(mock.activeMocks()).toStrictEqual([])
  })

  it('creates an issue without assigning anyone', async () => {
    const mock = nock('https://api.github.com')

      .get('/repos/JasonEtco/tests/git/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200, {
        parents: []
      })

      .head('/repos/JasonEtco/tests/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200)

      .get('/repos/JasonEtco/tests/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200, loadDiff('basic'))

      .get('/search/issues')
      .query(true)
      .reply(200, {
        items: []
      })

      .get('/repos/JasonEtco/tests/contents/.github/config.yml')
      .reply(200, {
        content: loadConfig('autoAssignFalse')
      })

      .post('/repos/JasonEtco/tests/issues', parameters => {
        expect(parameters).toMatchSnapshot()

        return true
      })
      .reply(201, {})

    await probot.receive(event)
    expect(mock.activeMocks()).toStrictEqual([])
  })

  it('creates an issue and assigns the configured user', async () => {
    const mock = nock('https://api.github.com')

      .get('/repos/JasonEtco/tests/git/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200, {
        parents: []
      })

      .head('/repos/JasonEtco/tests/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200)

      .get('/repos/JasonEtco/tests/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200, loadDiff('basic'))

      .get('/search/issues')
      .query(true)
      .reply(200, {
        items: []
      })

      .get('/repos/JasonEtco/tests/contents/.github/config.yml')
      .reply(200, {
        content: loadConfig('autoAssignString')
      })

      .post('/repos/JasonEtco/tests/issues', parameters => {
        expect(parameters).toMatchSnapshot()

        return true
      })
      .reply(201, {})

    await probot.receive(event)
    expect(mock.activeMocks()).toStrictEqual([])
  })

  it('creates an issue and assigns the configured users', async () => {
    const mock = nock('https://api.github.com')

      .get('/repos/JasonEtco/tests/git/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200, {
        parents: []
      })

      .head('/repos/JasonEtco/tests/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200)

      .get('/repos/JasonEtco/tests/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200, loadDiff('basic'))

      .get('/search/issues')
      .query(true)
      .reply(200, {
        items: []
      })

      .get('/repos/JasonEtco/tests/contents/.github/config.yml')
      .reply(200, {
        content: loadConfig('autoAssignArr')
      })

      .post('/repos/JasonEtco/tests/issues', parameters => {
        expect(parameters).toMatchSnapshot()

        return true
      })
      .reply(201, {})

    await probot.receive(event)
    expect(mock.activeMocks()).toStrictEqual([])
  })

  it('does not create any issues if no todos are found', async () => {
    const mock = nock('https://api.github.com')

      .get('/repos/JasonEtco/tests/git/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200, {
        parents: []
      })

      .head('/repos/JasonEtco/tests/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200)

      .get('/repos/JasonEtco/tests/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200, loadDiff('none'))

      .get('/repos/JasonEtco/tests/contents/.github/config.yml')
      .reply(404, {})
      .get('/repos/JasonEtco/.github/contents/.github/config.yml')
      .reply(404, {})

    await probot.receive(event)
    expect(mock.activeMocks()).toStrictEqual([])
  })

  it('does not create any issues if the push is not on the default branch', async () => {
    nock('https://api.github.com')
    await probot.receive({ name: 'push', payload: { ...pushEvent, ref: 'not-master' } })
  })

  it('does not create an issue that already exists', async () => {
    const mock = nock('https://api.github.com')

      .get('/repos/JasonEtco/tests/git/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200, {
        parents: []
      })

      .head('/repos/JasonEtco/tests/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200)

      .get('/repos/JasonEtco/tests/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200, loadDiff('basic'))

      .get('/search/issues')
      .query(true)
      .reply(200, {
        items: [{ title: 'I am an example title', state: 'open' }]
      })

      .get('/repos/JasonEtco/tests/contents/.github/config.yml')
      .reply(404, {})
      .get('/repos/JasonEtco/.github/contents/.github/config.yml')
      .reply(404, {})

    await probot.receive(event)
    expect(mock.activeMocks()).toStrictEqual([])
  })

  it('does not create the same issue twice in the same run', async () => {
    const mock = nock('https://api.github.com')

      .get('/repos/JasonEtco/tests/git/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200, {
        parents: []
      })

      .head('/repos/JasonEtco/tests/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200)

      .get('/repos/JasonEtco/tests/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200, loadDiff('duplicate'))

      .get('/search/issues')
      .query(true)
      .reply(200, {
        items: []
      })

      .get('/repos/JasonEtco/tests/contents/.github/config.yml')
      .reply(404, {})
      .get('/repos/JasonEtco/.github/contents/.github/config.yml')
      .reply(404, {})

      .post('/repos/JasonEtco/tests/issues', parameters => {
        expect(parameters).toMatchSnapshot()

        return true
      })
      .reply(201, {})

    await probot.receive(event)
    expect(mock.activeMocks()).toStrictEqual([])
  })

  it('creates an issue if the search does not have an issue with the correct title', async () => {
    const mock = nock('https://api.github.com')

      .get('/repos/JasonEtco/tests/git/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200, {
        parents: []
      })

      .head('/repos/JasonEtco/tests/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200)

      .get('/repos/JasonEtco/tests/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200, loadDiff('basic'))

      .get('/search/issues')
      .query(true)
      .reply(200, {
        items: [{ title: 'Not found', state: 'open' }]
      })

      .get('/repos/JasonEtco/tests/contents/.github/config.yml')
      .reply(404, {})
      .get('/repos/JasonEtco/.github/contents/.github/config.yml')
      .reply(404, {})

      .post('/repos/JasonEtco/tests/issues', parameters => {
        expect(parameters).toMatchSnapshot()

        return true
      })
      .reply(201, {})

    await probot.receive(event)
    expect(mock.activeMocks()).toStrictEqual([])
  })

  it('creates many (5) issues', async () => {
    const mock = nock('https://api.github.com')

      .get('/repos/JasonEtco/tests/git/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200, {
        parents: []
      })

      .head('/repos/JasonEtco/tests/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200)

      .get('/repos/JasonEtco/tests/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200, loadDiff('many'))

      .get('/search/issues')
      .query(true)
      .times(5)
      .reply(200, {
        items: []
      })

      .get('/repos/JasonEtco/tests/contents/.github/config.yml')
      .reply(404, {})
      .get('/repos/JasonEtco/.github/contents/.github/config.yml')
      .reply(404, {})

      .post('/repos/JasonEtco/tests/issues', parameters => {
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

      .get('/repos/JasonEtco/tests/git/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200, {
        parents: []
      })

      .head('/repos/JasonEtco/tests/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200)

      .get('/repos/JasonEtco/tests/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200, loadDiff('config'))

      .get('/repos/JasonEtco/tests/contents/.github/config.yml')
      .reply(404, {})
      .get('/repos/JasonEtco/.github/contents/.github/config.yml')
      .reply(404, {})

    await probot.receive(event)
    expect(mock.activeMocks()).toStrictEqual([])
  })

  it('ignores changes to the bin directory', async () => {
    const mock = nock('https://api.github.com')

      .get('/repos/JasonEtco/tests/git/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200, {
        parents: []
      })

      .head('/repos/JasonEtco/tests/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200)

      .get('/repos/JasonEtco/tests/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200, loadDiff('bin'))

      .get('/repos/JasonEtco/tests/contents/.github/config.yml')
      .reply(200, {
        content: loadConfig('excludeBin')
      })

    await probot.receive(event)
    expect(mock.activeMocks()).toStrictEqual([])
  })

  it('ignores pushes not to master', async () => {
    nock('https://api.github.com')
    await probot.receive({ event: event.event, payload: { ...event.payload, ref: 'not/the/master/branch' } })
  })

  it('ignores merge commits', async () => {
    const mock = nock('https://api.github.com')

      .get('/repos/JasonEtco/tests/git/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200, {
        parents: [1, 2]
      })

    await probot.receive(event)
    expect(mock.activeMocks()).toStrictEqual([])
  })

  it('creates an issue with a body line', async () => {
    const mock = nock('https://api.github.com')

      .get('/repos/JasonEtco/tests/git/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200, {
        parents: []
      })

      .head('/repos/JasonEtco/tests/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200)

      .get('/repos/JasonEtco/tests/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200, loadDiff('body'))

      .get('/search/issues')
      .query(true)
      .reply(200, {
        items: []
      })

      .get('/repos/JasonEtco/tests/contents/.github/config.yml')
      .reply(404, {})
      .get('/repos/JasonEtco/.github/contents/.github/config.yml')
      .reply(404, {})

      .post('/repos/JasonEtco/tests/issues', parameters => {
        expect(parameters).toMatchSnapshot()

        return true
      })
      .reply(201, {})

    await probot.receive(event)
    expect(mock.activeMocks()).toStrictEqual([])
  })

  it('creates an issue with a custom keyword config', async () => {
    const mock = nock('https://api.github.com')

      .get('/repos/JasonEtco/tests/git/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200, {
        parents: []
      })

      .head('/repos/JasonEtco/tests/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200)

      .get('/repos/JasonEtco/tests/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200, loadDiff('custom-keyword'))

      .get('/search/issues')
      .query(true)
      .reply(200, {
        items: []
      })

      .get('/repos/JasonEtco/tests/contents/.github/config.yml')
      .reply(200, {
        content: loadConfig('keywordsString')
      })

      .post('/repos/JasonEtco/tests/issues', parameters => {
        expect(parameters).toMatchSnapshot()

        return true
      })
      .reply(201, {})

    await probot.receive(event)
    expect(mock.activeMocks()).toStrictEqual([])
  })

  it('creates an issue with a body line with one body keyword', async () => {
    const mock = nock('https://api.github.com')

      .get('/repos/JasonEtco/tests/git/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200, {
        parents: []
      })

      .head('/repos/JasonEtco/tests/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200)

      .get('/repos/JasonEtco/tests/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200, loadDiff('body'))

      .get('/search/issues')
      .query(true)
      .reply(200, {
        items: []
      })

      .get('/repos/JasonEtco/tests/contents/.github/config.yml')
      .reply(200, {
        content: loadConfig('bodyString')
      })

      .post('/repos/JasonEtco/tests/issues', parameters => {
        expect(parameters).toMatchSnapshot()

        return true
      })
      .reply(201, {})

    await probot.receive(event)
    expect(mock.activeMocks()).toStrictEqual([])
  })

  it('reopens a closed issue', async () => {
    const mock = nock('https://api.github.com')

      .get('/repos/JasonEtco/tests/git/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200, {
        parents: []
      })

      .head('/repos/JasonEtco/tests/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200)

      .get('/repos/JasonEtco/tests/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200, loadDiff('basic'))

      .get('/search/issues')
      .query(true)
      .reply(200, {
        items: [{ number: 1, title: 'I am an example title', state: 'closed' }]
      })

      .get('/repos/JasonEtco/tests/contents/.github/config.yml')
      .reply(404, {})
      .get('/repos/JasonEtco/.github/contents/.github/config.yml')
      .reply(404, {})

      .patch('/repos/JasonEtco/tests/issues/1', parameters => {
        expect(parameters).toMatchSnapshot()

        return true
      })
      .reply(201, {})

      .post('/repos/JasonEtco/tests/issues/1/comments', parameters => {
        expect(parameters).toMatchSnapshot()

        return true
      })
      .reply(201, {})

    await probot.receive(event)
    expect(mock.activeMocks()).toStrictEqual([])
  })

  it('respects the reopenClosed config', async () => {
    const mock = nock('https://api.github.com')

      .get('/repos/JasonEtco/tests/git/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200, {
        parents: []
      })

      .head('/repos/JasonEtco/tests/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200)

      .get('/repos/JasonEtco/tests/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200, loadDiff('basic'))

      .get('/search/issues')
      .query(true)
      .reply(200, {
        items: [{ title: 'I am an example title', state: 'closed' }]
      })

      .get('/repos/JasonEtco/tests/contents/.github/config.yml')
      .reply(200, {
        content: loadConfig('reopenClosedFalse')
      })

    await probot.receive(event)
    expect(mock.activeMocks()).toStrictEqual([])
  })

  it('does not show the blob if blobLines is false', async () => {
    const mock = nock('https://api.github.com')

      .get('/repos/JasonEtco/tests/git/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200, {
        parents: []
      })

      .head('/repos/JasonEtco/tests/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200)

      .get('/repos/JasonEtco/tests/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200, loadDiff('basic'))

      .get('/search/issues')
      .query(true)
      .reply(200, {
        items: []
      })

      .get('/repos/JasonEtco/tests/contents/.github/config.yml')
      .reply(200, {
        content: loadConfig('blobLinesFalse')
      })

      .post('/repos/JasonEtco/tests/issues', parameters => {
        expect(parameters).toMatchSnapshot()

        return true
      })
      .reply(201, {})

    await probot.receive(event)
    expect(mock.activeMocks()).toStrictEqual([])
  })

  it('cuts the blobLines', async () => {
    const mock = nock('https://api.github.com')

      .get('/repos/JasonEtco/tests/git/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200, {
        parents: []
      })

      .head('/repos/JasonEtco/tests/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200)

      .get('/repos/JasonEtco/tests/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200, loadDiff('blob-past-end'))

      .get('/search/issues')
      .query(true)
      .reply(200, {
        items: []
      })

      .get('/repos/JasonEtco/tests/contents/.github/config.yml')
      .reply(404, {})
      .get('/repos/JasonEtco/.github/contents/.github/config.yml')
      .reply(404, {})

      .post('/repos/JasonEtco/tests/issues', parameters => {
        expect(parameters).toMatchSnapshot()

        return true
      })
      .reply(201, {})

    await probot.receive(event)
    expect(mock.activeMocks()).toStrictEqual([])
  })

  it('does nothing with a diff over the max size', async () => {
    const mock = nock('https://api.github.com')

      .get('/repos/JasonEtco/tests/git/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200, {
        parents: []
      })

      .head('/repos/JasonEtco/tests/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200)

      .get('/repos/JasonEtco/tests/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200, '', { 'content-length': 2000001 })

    await probot.receive(event)
    expect(mock.activeMocks()).toStrictEqual([])
  })

  it('creates an issue and respects GHE_HOST', async () => {
    process.env.GHE_HOST = 'fakegittillyoumakegit.com'

    const mock = nock('https://fakegittillyoumakegit.com')

      .get('/api/v3/repos/JasonEtco/tests/git/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200, {
        parents: []
      })

      .head('/api/v3/repos/JasonEtco/tests/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200)

      .get('/api/v3/repos/JasonEtco/tests/commits/e06c237a0c041f5a0a61f1c361f7a1d6f3d669af')
      .reply(200, loadDiff('basic'))

      .get('/api/v3/search/issues')
      .query(true)
      .reply(200, {
        items: []
      })

      .get('/api/v3/repos/JasonEtco/tests/contents/.github/config.yml')
      .reply(404, {})
      .get('/api/v3/repos/JasonEtco/.github/contents/.github/config.yml')
      .reply(404, {})

      .post('/api/v3/repos/JasonEtco/tests/issues', parameters => {
        expect(parameters).toMatchSnapshot()

        return true
      })
      .reply(201, {})

    await probot.receive(event)
    expect(mock.activeMocks()).toStrictEqual([])
  })
})
