const checkForDuplicateIssue = require('../../lib/utils/check-for-duplicate-issue')
const payload = require('../fixtures/payloads/push.json')

describe('check-for-duplicate-issue', () => {
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

  it('returns undefined if no duplicate issue is found', async () => {
    const actual = await checkForDuplicateIssue(context, 'hello')
    expect(actual).toBe(undefined)
  })

  it('returns the issue if a duplicate issue is found in context.todos', async () => {
    context.todos.push('hello')
    const actual = await checkForDuplicateIssue(context, 'hello')
    expect(actual).toBe('hello')
  })

  it('returns the issue if a duplicate issue is found by searching', async () => {
    const mock = { data: { total_count: 1, items: [{ title: 'hello' }] } }
    context.github.search.issuesAndPullRequests.mockReturnValueOnce(mock)
    const actual = await checkForDuplicateIssue(context, 'hello')
    expect(actual).toEqual(mock.data.items[0])
  })
})
