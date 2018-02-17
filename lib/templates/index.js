const fs = require('fs')
const { join } = require('path')
const { handlebars } = require('hbs')

module.exports = {
  comment: handlebars.compile(fs.readFileSync(join(__dirname, 'comment.md'), 'utf8')),
  issue: handlebars.compile(fs.readFileSync(join(__dirname, 'issue.md'), 'utf8'))
}
