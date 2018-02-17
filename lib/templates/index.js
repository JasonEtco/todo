const fs = require('fs')
const { join } = require('path')
const { handlebars } = require('hbs')

const compile = filename =>
  handlebars.compile(fs.readFileSync(join(__dirname, `${filename}.md`), 'utf8'))

module.exports = {
  comment: compile('comment'),
  issue: compile('issue'),
  titleChange: compile('titleChange')
}
