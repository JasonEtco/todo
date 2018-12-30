const { gimmeApp, loadConfig, loadDiff } = require('./helpers')
const pullRequestOpened = require('./fixtures/payloads/pull_request.opened.json')

describe('pull-request-handler', () => {
  let app, github
  const event = { name: 'pull_request', payload: pullRequestOpened }

  beforeEach(() => {
    const gimme = gimmeApp()
    app = gimme.app
    github = gimme.github
  })

  it('comments on a pull request', async () => {
    await app.receive(event)
    expect(github.issues.createComment).toHaveBeenCalledTimes(1)
    expect(github.issues.createComment.mock.calls[0]).toMatchSnapshot()
  })

  it('comments on a pull request and mentions the assigned user', async () => {
    github.repos.getContent.mockReturnValueOnce(loadConfig('autoAssignString'))
    await app.receive(event)
    expect(github.issues.createComment.mock.calls[0]).toMatchSnapshot()
  })

  it('comments on a pull request and mentions the assigned users', async () => {
    github.repos.getContent.mockReturnValueOnce(loadConfig('autoAssignArr'))
    await app.receive(event)
    expect(github.issues.createComment.mock.calls[0]).toMatchSnapshot()
  })

  it('does not create duplicate comments', async () => {
    github.issues.getComments.mockReturnValueOnce(Promise.resolve({ data: [{
      body: '## I am an example title'
    }] }))

    await app.receive(event)
    expect(github.issues.createComment).not.toHaveBeenCalled()
  })

  it('creates many (5) comments', async () => {
    github.pullRequests.get.mockReturnValueOnce(loadDiff('many'))
    await app.receive(event)
    expect(github.issues.createComment).toHaveBeenCalledTimes(5)
  })

  it('ignores changes to the config file', async () => {
    github.pullRequests.get.mockReturnValueOnce(loadDiff('config'))
    await app.receive(event)
    expect(github.issues.createComment).not.toHaveBeenCalled()
  })

  it('ignores changes to the bin directory', async () => {
    github.pullRequests.get.mockReturnValueOnce(loadDiff('bin'))
    github.repos.getContent.mockReturnValueOnce(loadConfig('excludeBin'))
    await app.receive(event)
    expect(github.issues.createComment).not.toHaveBeenCalled()
  })

  it('works with a string as the keyword config', async () => {
    github.repos.getContent.mockReturnValueOnce(loadConfig('keywordsString'))
    await app.receive(event)
    expect(github.issues.createComment.mock.calls[0]).toMatchSnapshot()
  })

  it('creates a comment with a body line', async () => {
    github.pullRequests.get.mockReturnValueOnce(loadDiff('body'))
    await app.receive(event)
    expect(github.issues.createComment.mock.calls[0]).toMatchSnapshot()
  })

  it('deletes a comment on a removed TODO', async () => {
    github.pullRequests.get.mockReturnValueOnce(loadDiff('remove-todo'))
    github.issues.getComments.mockReturnValueOnce(Promise.resolve({ data: [{
      body: '## I am an example title\n\nHi!', id: 123
    }] }))
    await app.receive(event)
    expect(github.issues.editComment).toHaveBeenCalled()
    expect(github.issues.editComment).toHaveBeenCalledWith({
      comment_id: 123,
      owner: 'JasonEtco',
      repo: 'tests',
      number: pullRequestOpened.number,
      body: '<details><summary><strong>I am an example title</strong> ✅</summary>\n\n## I am an example title\n\nHi!</details>'
    })
  })

  it('does nothing on a non-existant comment on a removed TODO', async () => {
    github.pullRequests.get.mockReturnValueOnce(loadDiff('remove-todo'))
    github.issues.getComments.mockReturnValueOnce(Promise.resolve({ data: [{
      body: '## I am not an example title'
    }] }))
    await app.receive(event)
    expect(github.issues.editComment).not.toHaveBeenCalled()
  })
})
