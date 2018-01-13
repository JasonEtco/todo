/**
 * Searches a content string for titles by the keyword
 * @param {string} contents - File contents as a utf8 string
 * @param {object} cfg - Config object
 * @param {string} [title] - Title to search for
 */
module.exports = (contents, cfg, title) => {
  const regexFlags = cfg.caseSensitive ? 'g' : 'gi'
  const re = new RegExp(`${cfg.keyword}\\s?${title || '(.*)'}`, regexFlags)

  const matches = contents.match(re)
  if (matches) {
    return matches.map(title => title.replace(new RegExp(`${cfg.keyword} `, regexFlags), ''))
  }
}
