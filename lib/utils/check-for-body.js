const { lineBreak } = require('./helpers')

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
      if (bodyPieces.length > 0 && bodyPieces[bodyPieces.length - 1] !== '\n') bodyPieces.push(' ')
      bodyPieces.push(lineBreak(matches.groups.body).trim())
    }
  }

  return bodyPieces.length ? bodyPieces.join('') : false
}
