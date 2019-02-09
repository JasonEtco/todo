const { Application } = require('probot')
const issueEdited = require('./fixtures/payloads/issues.edited.json')
const plugin = require('..')

describe('issue-rename-handler', () => {
  let app, github, event

  beforeEach(() => {
    app = new Application()
    event = { name: 'issues', payload: issueEdited }

    github = {
      issues: {
        update: jest.fn(),
        createComment: jest.fn()
      }
    }

    app.auth = jest.fn(() => Promise.resolve(github))
    app.load(plugin)
  })

  it('un-edits the issue title', async () => {
    await app.receive(event)
    expect(github.issues.update.mock.calls[0][0]).toMatchSnapshot()
    expect(github.issues.createComment.mock.calls[0][0]).toMatchSnapshot()
  })

  it('only acts if the title is edited', async () => {
    event.payload.changes = {}
    await app.receive(event)
    expect(github.issues.update).not.toHaveBeenCalled()
    expect(github.issues.createComment).not.toHaveBeenCalled()
  })
})
