const metadata = require('../../lib/metadata')

describe('metadata', () => {
  const context = {
    payload: {
      installation: {
        id: 10000
      }
    }
  }

  it('returns null if the issue has no body', () => {
    const value = metadata(context, {}).get('title')
    expect(value).toBe(null)
  })

  it('returns null if there are no matches', () => {
    const value = metadata(context, { body: 'hello!' }).get('title')
    expect(value).toBe(null)
  })

  it('returns the whole object', () => {
    const value = metadata(context, { body: 'hello!\n\n<!-- probot = {"10000":{"title":"hey","sha":"123"}} -->' }).get()
    expect(value).toEqual({
      title: 'hey',
      sha: '123'
    })
  })
})
