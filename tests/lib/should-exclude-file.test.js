const shouldExcludeFile = require('../../lib/utils/should-exclude-file')

describe('shouldExcludeFile', () => {
  let logger

  beforeEach(() => {
    logger = { debug: jest.fn() }
  })

  it('returns true for the .github/config.yml file', () => {
    const actual = shouldExcludeFile(logger, '.github/config.yml')
    expect(actual).toBe(true)
  })

  it('returns true for any files that match the alwaysExclude RegEx', () => {
    const actual = shouldExcludeFile(logger, 'example.min.js')
    expect(actual).toBe(true)
  })

  it('returns true for any files that match the provded pattern', () => {
    const actual = shouldExcludeFile(logger, 'pizza.js', 'pi')
    expect(actual).toBe(true)
  })
})
