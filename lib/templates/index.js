const fs = require('fs')
const { handlebars } = require('hbs')

module.exports = {
  comment: handlebars.compile(fs.readFileSync('comment.md', 'utf8')),
  issue: handlebars.compile(fs.readFileSync('issue.md', 'utf8'))
}
