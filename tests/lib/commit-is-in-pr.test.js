const commitIsInPR = require('../../lib/commit-is-in-pr')

const prs = { data: [
  { head: { ref: 'branch' }, number: 10 }
]}

const makeContext = (ref = 'refs/heads/branch', prs) => ({
  repo: () => {},
  payload: { ref }
})

describe('commit-is-in-pr', () => {
  it('returns a PR number if found', async () => {
    const pr = commitIsInPR(makeContext(), prs)
    expect(pr).toBe(10)
  })

  it('returns false if the commit is not in a PR', async () => {
    const pr = commitIsInPR(makeContext('pizza'), prs)
    expect(pr).toBe(false)
  })

  it('returns false if no PRs are found', async () => {
    const pr = commitIsInPR(makeContext('pizza'), { data: [] })
    expect(pr).toBe(false)
  })
})
