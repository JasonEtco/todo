const { handlebars } = require('hbs')

// Register a githubHost global helper to make links respect the GHE_HOST env var
handlebars.registerHelper('githubHost', () => process.env.GHE_HOST || 'github.com')

const compile = filename =>
  handlebars.compile(require(`./${filename}`))

module.exports = {
  comment: compile('comment'),
  issue: compile('issue'),
  issueFromMerge: compile('issueFromMerge'),
  titleChange: compile('titleChange'),
  reopenClosed: compile('reopenClosed')
}
