const mainLoop = require('../../lib/utils/main-loop')

describe('main-loop', () => {
  let context, handler

  beforeEach(() => {
    context = {
      repo: (obj) => ({
        owner: 'JasonEtco',
        repo: 'todo',
        ...obj
      }),
      github: {
        issues: {
          createLabel: jest.fn()
        }
      }
    }

    handler = jest.fn()
  })

  it('throws on an invalid config', async () => {
    expect.assertions(2)

    context.config = jest.fn(() => Promise.resolve({
      todo: { pizza: true }
    }))

    try {
      await mainLoop(context, handler)
    } catch (err) {
      expect(err).toMatchSnapshot()
    }

    expect(handler).not.toHaveBeenCalled()
  })
})
