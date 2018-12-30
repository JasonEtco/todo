const avoidReplicationLag = require('../../lib/utils/avoid-replication-lag')

describe('avoidReplicationLag', () => {
  let func, sleeper

  beforeEach(() => {
    sleeper = jest.fn()
    func = avoidReplicationLag(sleeper)
  })

  it('sleeps on a GET request', async () => {
    await func({ method: 'GET' })
    expect(sleeper).toHaveBeenCalled()
  })

  it('does not sleep on a non-GET request', async () => {
    await func({ method: 'POST' })
    expect(sleeper).not.toHaveBeenCalled()
  })
})
