const defaultConfig = require('./default-config')
const generateLabel = require('./generate-label')

/**
 * Returns the regex, labels and config object used in every handler
 * @param {object} context - Probot context object
 * @returns {object}
 */
module.exports = async context => {
  const config = await context.config('config.yml')
  const cfg = config && config.todo ? Object.assign({}, defaultConfig, config.todo) : defaultConfig
  const labels = await generateLabel(context, cfg)
  const keywords = Array.isArray(config.keyword) ? config.keyword : [config.keyword]

  return {
    config: cfg,
    regex: new RegExp(`.+()\\s(?<keyword>${keywords.join('|')})\\s(?<title>.*)`),
    labels
  }
}
