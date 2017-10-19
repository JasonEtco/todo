const reopenClosed = require('../../lib/reopen-closed')
const payloads = require('../fixtures/payloads')
const fs = require('fs')
const path = require('path')

describe('reopen-closed', () => {
  const config = {reopenClosed: true, keyword: '@todo'}
  const log = { info: jest.fn() }
  let context

  beforeEach(() => {
    context = {
      repo: (obj) => ({
        owner: payloads.basic.payload.repository.owner.login,
        repo: payloads.basic.payload.repository.name,
        ...obj
      }),
      github: {
        issues: {
          edit: jest.fn(),
          createComment: jest.fn()
        }
      }
    }
  })

  it('reopens a closed issue', async () => {
    await reopenClosed(log, context, config, 3, 'index.js', 'sha')
    expect(context.github.issues.createComment).toHaveBeenCalledTimes(1)
    expect(context.github.issues.createComment).toHaveBeenLastCalledWith({
      repo: 'test',
      owner: 'JasonEtco',
      number: 3,
      body: fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'bodies', 'reopen.txt'), 'utf8')
    })
  })
})
