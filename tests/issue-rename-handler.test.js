const nock = require('nock')
const { Probot, ProbotOctokit } = require('probot')
const issueEdited = require('./fixtures/payloads/issues.edited.json')
const plugin = require('..')

describe('issue-rename-handler', () => {
  const event = { name: 'issues', payload: issueEdited }
  let probot

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

  it('un-edits the issue title', async () => {
    const mock = nock('https://api.github.com')
      .patch('/repos/JasonEtco/tests/issues/35', parameters => {
        expect(parameters).toMatchSnapshot()
        return true
      })
      .reply(200, {})

      .post('/repos/JasonEtco/tests/issues/35/comments', parameters => {
        expect(parameters).toMatchSnapshot()
        return true
      })
      .reply(201, {})

    await probot.receive(event)
    expect(mock.activeMocks()).toStrictEqual([])
  })

  it('only acts if the title is edited', async () => {
    event.payload.changes = {}
    await probot.receive(event)
  })
})
