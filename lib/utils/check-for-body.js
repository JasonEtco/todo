const { lineBreak } = require('./helpers')

module.exports = (changes, changeIndex, config) => {
  var bodylines = []
  for (var i = 1; changes[changeIndex + i]; i++) {
    const nextLine = changes[changeIndex + i]

    const keywords = Array.isArray(config.bodyKeyword) ? config.bodyKeyword : [config.bodyKeyword]
    const BODY_REG = new RegExp(`.+?(?<keyword>${keywords.join('|')}):?(?:\\s(?<body>.*))?`)
    const matches = BODY_REG.exec(nextLine.content)
    if (!matches) break

    const body = matches.groups.body || ''
    bodylines.push(lineBreak(body))
  }
  if (bodylines.length === 0) {
    return false
  }

  return bodylines.reduce((acc, line) => {
    if (line.trim() !== '' && acc.length !== 0 && acc.slice(-1) !== '\n') {
      acc += ' ' + line.trim()
    } else if (line.trim() !== '') {
      acc += line.trim()
    } else {
      acc += '\n'
    }
    return acc
  }, '')
}
