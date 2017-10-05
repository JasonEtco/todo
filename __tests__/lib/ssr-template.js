const fs = require('fs')
const path = require('path')
const ssrTemplate = require('../../lib/ssr-template')

describe('ssr-template', () => {
  it('returns the correct HTML string', async () => {
    const str = ssrTemplate('hello')
    expect(str).toBe(fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'page.html'), 'utf8'))
  })
})
