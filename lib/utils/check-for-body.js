const { lineBreak } = require('./helpers')

module.exports = (changes, changeIndex, config) => {
  const nextLine = changes[changeIndex + 1]
  if (!nextLine) return false

  const keywords = Array.isArray(config.bodyKeyword) ? config.bodyKeyword : [config.bodyKeyword]
  const BODY_REG = new RegExp(`.+(?<keyword>${keywords.join('|')}):?\\s(?<body>.*)`)
  const matches = BODY_REG.exec(nextLine.content)
  if (!matches) return false

  const { body } = matches.groups
  return lineBreak(body)
}
