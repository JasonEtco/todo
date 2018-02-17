const defaultConfig = require('./default-config')

module.exports = async context => {
  const config = await context.config('config.yml')
  const cfg = config && config.todo ? {...defaultConfig, ...config.todo} : defaultConfig
  const keywords = Array.isArray(cfg.keyword) ? cfg.keyword : [cfg.keyword]
  const reg = new RegExp(`^diff --git a/.+ b/(.+)[\\s\\S]+^@@ -?(\\d+).+[\\r\\n]([\\s\\S]+(^(\\+).*(${keywords.join('|')})(?:[:-\\s]+)?(.*))[\\s\\S]+)(^diff --git)?`, 'gm')

  return {
    config: cfg,
    regex: reg
  }
}
