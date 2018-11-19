const parseDiff = require('parse-diff')
const shouldExcludeFile = require('./should-exclude-file')
const getDiff = require('./get-diff')
const getDetails = require('./get-details')
const checkForBody = require('./check-for-body')
const defaultConfig = require('./default-config')
const generateLabel = require('./generate-label')

module.exports = async (context, handler) => {
  // Grab the config file
  const configFile = await context.config('config.yml')
  const config = configFile && configFile.todo ? Object.assign({}, defaultConfig, configFile.todo) : defaultConfig
  const keywords = Array.isArray(config.keyword) ? config.keyword : [config.keyword]

  // Ensure that all the labels we need are present
  const labels = await generateLabel(context, config)

  // Get the diff for this commit or PR
  const diff = await getDiff(context)

  // RegEx that matches lines with the configured keywords
  const regex = new RegExp(`.+()\\s(?<keyword>${keywords.join('|')})\\s(?<title>.*)`)

  // Parse the diff as files
  const files = parseDiff(diff)

  for (const file of files) {
    if (shouldExcludeFile(context.log, file.to, config.exclude)) continue

    // Loop through every chunk in the file
    for (const chunk of file.chunks) {
      // Chunks can have multiple changes
      for (const indexStr in chunk.changes) {
        const index = parseInt(indexStr, 10)
        const change = chunk.changes[index]

        // Attempt to find a matching line: TODO Something something
        const matches = regex.exec(change.content)
        if (!matches) continue

        const { title, keyword } = matches.groups

        const deets = getDetails({ context, config, chunk, line: change.ln || change.ln2 })

        await handler({
          title,
          bodyComment: checkForBody(chunk.changes, index, config),
          config,
          keyword,
          filename: file.to,
          chunk,
          index,
          labels,
          ...deets
        })
      }
    }
  }
}
