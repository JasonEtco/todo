const { handlebars } = require('hbs')

const compile = filename =>
  handlebars.compile(require(`./${filename}`))

module.exports = {
  comment: compile('comment'),
  issue: compile('issue'),
  issueFromMerge: compile('issueFromMerge'),
  titleChange: compile('titleChange'),
  reopenClosed: compile('reopenClosed'),
  close: compile('close')
}
