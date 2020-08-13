const mainLoop = require('../../lib/utils/main-loop')
const { loadDiff } = require('../helpers')

describe('main-loop', () => {
  let context, handler

  beforeEach(() => {
    context = {
      event: 'push',
      payload: require('../fixtures/payloads/push.json'),
      config: jest.fn(),
      log: f => f,
      repo: (obj) => ({
        owner: 'JasonEtco',
        repo: 'todo',
        ...obj
      }),
      github: {
        issues: {
          createLabel: jest.fn()
        },
        repos: {
          getCommit: jest.fn(() => {
            return {
              data: loadDiff('basic'),
              headers: { 'content-length': 1 }
            }
          }).mockName('repos.getCommit')
        }
      }
    }

    handler = jest.fn()
  })

  it('uses the default config if context.config return value does not have todo', async () => {
    context.config = jest.fn(() => Promise.resolve({
      pizza: true
    }))

    await mainLoop(context, handler)
    expect(handler).toHaveBeenCalled()
  })

  it('throws on an invalid config', async () => {
    context.config = jest.fn(() => Promise.resolve({
      todo: { pizza: true }
    }))

    await expect(mainLoop(context, handler))
      .rejects
      .toThrowErrorMatchingSnapshot()
    expect(handler).not.toHaveBeenCalled()
  })

  it('does nothing if a title is only whitespace', async () => {
    context.github.repos.getCommit.mockResolvedValue({
      data: loadDiff('title-with-whitespace'),
      headers: {
        'content-length': 1
      }
    })
    await mainLoop(context, handler)
    expect(handler).not.toHaveBeenCalled()
  })

  it('does nothing if a keyword is in the middle of a sentence', async () => {
    context.github.repos.getCommit.mockResolvedValue({
      data: loadDiff('middle-of-sentence'),
      headers: {
        'content-length': 1
      }
    })
    await mainLoop(context, handler)
    expect(handler).not.toHaveBeenCalled()
  })
})
