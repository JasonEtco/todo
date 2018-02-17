const defaultConfig = require('./default-config')
const generateAssignedTo = require('./generate-assigned-to')
const { comment } = require('./templates')

// We already have an instance of handlebars from Probot's hbs dependency

module.exports = async context => {
  const { data: diff } = await context.github.pullRequests.get(context.issue({
    headers: { Accept: 'application/vnd.github.diff' }
  }))
  const config = await context.config('config.yml')
  const cfg = config && config.todo ? {...defaultConfig, ...config.todo} : defaultConfig

  const keywords = Array.isArray(cfg.keyword) ? cfg.keyword : [cfg.keyword]
  const reg = new RegExp(`^diff --git a/.+ b/(.+)[\\s\\S]+^@@ -?(\\d+).+[\\r\\n]([\\s\\S]+(^(\\+).*(${keywords.join('|')})(?:[:-\\s]+)?(.*))[\\s\\S]+)(^diff --git)?`, 'gm')

  let match
  while ((match = reg.exec(diff)) !== null) {
    context.log('Match found')
    const {
      1: filename,
      3: contents,
      4: matchedLine,
      5: prefix,
      6: keyword,
      7: title
    } = match

    // TODO: Check if comment already exists

    const lineNumber = parseInt(match[2])

    context.log({ filename, lineNumber, matchedLine, prefix, keyword, title })

    const split = contents.substring(0, contents.indexOf(matchedLine)).split(/(?:\r\n|\n)/g)
    const start = lineNumber + split.length

    const { sha, user } = context.payload.pull_request.head
    const { number } = context.payload.pull_request

    const assignedToString = generateAssignedTo(cfg.autoAssign, user.login, number)
    const body = comment(context.repo({
      title,
      sha,
      assignedToString,
      number,
      start,
      filename,
      keyword
    }))

    return context.github.issues.createComment(context.issue({ body }))
  }
}
