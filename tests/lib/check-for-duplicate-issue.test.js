const checkForExistingIssue = require('../../lib/utils/check-for-existing-issue')
const payload = require('../fixtures/payloads/push.json')

describe('check-for-existing-issue', () => {
  let context

  beforeEach(() => {
    context = {
      payload,
      github: {
        search: {
          issuesAndPullRequests: jest.fn(() => Promise.resolve({ data: { items: [] } }))
        }
      },
      todos: []
    }
  })

  it('returns undefined if no existing issue is found', async () => {
    const actual = await checkForExistingIssue(context, 'hello')
    expect(actual).toBe(undefined)
  })

  it('returns the issue if a existing issue is found in context.todos', async () => {
    context.todos.push('hello')
    const actual = await checkForExistingIssue(context, 'hello')
    expect(actual).toBe('hello')
  })

  it('returns the issue if a existing issue is found by searching', async () => {
    const mock = { data: { total_count: 1, items: [{ title: 'hello' }] } }
    context.github.search.issuesAndPullRequests.mockReturnValueOnce(mock)
    const actual = await checkForExistingIssue(context, 'hello')
    expect(actual).toEqual(mock.data.items[0])
  })
})
