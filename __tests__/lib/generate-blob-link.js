const generateBlobLink = require('../../lib/generate-blob-link')
const payloads = require('../fixtures/payloads')
const fs = require('fs')
const path = require('path')

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
    const blobLink = generateBlobLink(context, 'index.js', contents, title, 'sha', config)
    expect(blobLink).toBe('https://github.com/JasonEtco/test/blob/sha/index.js#L3-L5')
  })

  it('generates the correct blob link when the file has fewer lines than start + blobLines', () => {
    const title = 'update helpers.ResizeImage to return error code and do something with it here'
    const contents = fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'files', 'more.txt'), 'utf8')
    config.blobLines = 5
    const blobLink = generateBlobLink(context, 'index.js', contents, title, 'sha', config)
    expect(blobLink).toBe('https://github.com/JasonEtco/test/blob/sha/index.js#L239-L242')
  })

  it('generates the correct blob link when the keyword is at the end of the file', () => {
    const title = 'End title'
    const contents = fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'files', 'at-end.js'), 'utf8')
    const blobLink = generateBlobLink(context, 'index.js', contents, title, 'sha', config)
    expect(blobLink).toBe('https://github.com/JasonEtco/test/blob/sha/index.js#L11')
  })
})
