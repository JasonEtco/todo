const generateBlobLink = require('../../lib/generate-blob-link')
const payloads = require('../fixtures/payloads')

describe('generate-blob-link', () => {
  let context
  let config

  beforeEach(() => {
    context = {
      repo: () => ({
        owner: payloads.basic.payload.repository.owner.login,
        repo: payloads.basic.payload.repository.name
      })
    }
    config = {
      keyword: '@todo',
      blobLines: 2
    }
  })

  it('generates a blob link string', () => {
    const title = 'example'
    const contents = '\n\n@todo example\n\na\na\na\n\na\na'
    const blobLink = generateBlobLink(context, 'index.js', contents, title, payloads.basic.payload.head_commit.id, config)
    expect(blobLink).toBe('https://github.com/JasonEtco/test/blob/f7d286aa6381bbb5045288496403d9427b0746e2/index.js#L3-L5')
  })
})
