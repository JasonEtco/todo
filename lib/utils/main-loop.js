const parseDiff = require('parse-diff')
const shouldExcludeFile = require('./should-exclude-file')
const getDiff = require('./get-diff')
const getDetails = require('./get-details')
const checkForBody = require('./check-for-body')
const configSchema = require('./config-schema')
const generateLabel = require('./generate-label')

module.exports = async (context, handler) => {
  // Grab the config file
  const configFile = await context.config('config.yml')
  const config = await configSchema.validate(configFile && configFile.todo ? configFile.todo : {})

  const keywords = Array.isArray(config.keyword) ? config.keyword : [config.keyword]

  // Ensure that all the labels we need are present
  const labels = await generateLabel(context, config)

  // Get the diff for this commit or PR
  const diff = await getDiff(context)

  // RegEx that matches lines with the configured keywords
  const regex = new RegExp(`.*(?<keyword>${keywords.join('|')})\\s?:?(?<title>.*)`)

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

        // Only act on added lines
        if (change.type !== 'add' && change.type !== 'del') continue

        // Attempt to find a matching line: TODO Something something
        const matches = regex.exec(change.content)
        if (!matches) continue

        // Trim whitespace to ensure a clean title
        const title = matches.groups.title.trim()

        // This might have matched a minified file, or something
        // huge. GitHub wouldn't allow this anyway, so let's just ignore it.
        if (!title || title.length > 256) continue

        // Get the details of this commit or PR
        const deets = getDetails({ context, config, chunk, line: change.ln || change.ln2 })

        const { owner, repo } = context.repo()
        context.log(`Item found [${title}] in [${owner}/${repo}] at [${deets.sha}]`)

        // Run the handler for this webhook listener
        await handler({
          keyword: matches.groups.keyword,
          bodyComment: checkForBody(chunk.changes, index, config),
          filename: file.to,
          title,
          config,
          chunk,
          index,
          labels,
          type: change.type,
          ...deets
        })
      }
    }
  }
}
