const shouldExcludeFile = require('./should-exclude-file')
const handlerSetup = require('./handler-setup')
const chunkDiff = require('./chunk-diff')
const getDetails = require('./get-details')
const checkForBody = require('./check-for-body')

module.exports = async (context, handler) => {
  const [
    { regex, config, labels },
    files
  ] = await Promise.all([
    handlerSetup(context),
    chunkDiff(context)
  ])

  for (const file of files) {
    if (shouldExcludeFile(context.log, file.to, config.exclude)) continue

    for (const chunk of file.chunks) {
      for (const indexStr in chunk.changes) {
        const index = parseInt(indexStr, 10)
        const change = chunk.changes[index]

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
