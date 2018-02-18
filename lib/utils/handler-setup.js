const defaultConfig = require('./default-config')
const generateLabel = require('./generate-label')

/**
 * Returns the regex, labels and config object used in every handler
 * @param {object} context - Probot context object
 * @returns {object}
 */
module.exports = async context => {
  const config = await context.config('config.yml')
  const cfg = config && config.todo ? {...defaultConfig, ...config.todo} : defaultConfig
  const labels = await generateLabel(context, cfg)
  const keywords = Array.isArray(cfg.keyword) ? cfg.keyword : [cfg.keyword]
  const reg = new RegExp(`^diff --git a/.+ b/(.+)[\\s\\S]+?^@{2}.+\\+(\\d+).+@{2}$([\\s\\S]+?(^(\\+).*(${keywords.join('|')})(?:[:-\\s]+)?(.*))[\\s\\S]*?)(?=\\n.*?^diff|^__END_OF_DIFF_PARSING__)`, 'gm')

  return {
    config: cfg,
    regex: reg,
    labels
  }
}
