const commitIsInPR = require('../../lib/commit-is-in-pr')

const prArr = [
  { head: { ref: 'master' }, number: 10 }
]

const makeContext = (ref = 'refs/heads/master', prs = prArr) => ({
  repo: () => {},
  payload: { ref },
  github: {
    pullRequests: {
      getAll: () => Promise.resolve({
        data: prs
      })
    }
  }
})

describe('commit-is-in-pr', () => {
  it('returns a PR number if found', async () => {
    const pr = await commitIsInPR(makeContext())
    expect(typeof pr).toBe('number')
    expect(pr).toBe(10)
  })

  it('returns false if the commit is not in a PR', async () => {
    const pr = await commitIsInPR(makeContext('pizza'))
    expect(pr).toBe(false)
  })

  it('returns false if no PRs are found', async () => {
    const pr = await commitIsInPR(makeContext('pizza', []))
    expect(pr).toBe(false)
  })
})
