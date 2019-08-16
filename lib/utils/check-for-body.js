const { lineBreak } = require('./helpers')
const showdown = require('showdown')
const { JSDOM } = require('jsdom')

/**
 * Prepares some details about the TODO
 * @param {import('parse-diff').Change[]} changes
 * @param {number} changeIndex
 * @param {object} config
 * @returns {string | boolean}
 */
module.exports = (changes, changeIndex, config) => {
  const bodyPieces = []
  const nextChanges = changes.slice(changeIndex + 1)
  const keywords = Array.isArray(config.bodyKeyword) ? config.bodyKeyword : [config.bodyKeyword]
  const BODY_REG = new RegExp(`.*(?<keyword>${keywords.join('|')}):?\\s?(?<body>.*)?`)

  for (const change of nextChanges) {
    const matches = BODY_REG.exec(change.content)
    if (!matches) break

    if (!matches.groups.body) {
      bodyPieces.push('\n')
    } else {
      bodyPieces.push(lineBreak(matches.groups.body))
    }
  }

  if (bodyPieces.length === 0) {
    return false
  }

  // Avoid GFM comment soft-breaks by parsing and unparsing the Markdown.
  const converter = new showdown.Converter({
    simplifiedAutoLink: true,
    parseImgDimensions: true,
    strikethrough: true,
    tables: true,
    tasklists: true
  })

  const dom = new JSDOM('<!DOCTYPE html>')

  return converter.makeMd(converter.makeHtml(bodyPieces.join('\n')), dom.window.document).trim()
}
