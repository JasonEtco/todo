const ignoreRepos = require('../../lib/ignore-repos')

describe('ignoreRepos', () => {
  let spy, func, context

  beforeEach(() => {
    spy = jest.fn()
    func = ignoreRepos(spy)
    context = {
      repo: () => ({ owner: 'JasonEtco', repo: 'todo' }),
      log: jest.fn()
    }
  })

  it('does call the handler if the repo is not being ignored', () => {
    process.env.IGNORED_REPOS = 'JasonEtco/pizza'
    func(context)
    expect(spy).toHaveBeenCalled()
  })

  it('does not call the handler if the repo is being ignored', () => {
    process.env.IGNORED_REPOS = 'JasonEtco/todo'
    func(context)
    expect(spy).not.toHaveBeenCalled()
  })

  afterEach(() => {
    delete process.env.IGNORED_REPOS
  })
})
