/**
 * Generate a blob link.
 * @param {string} file - File name
 * @param {string} contents - Contents of the file
 * @param {string} title - The title of the new issue
 * @param {string} sha - Commit where this todo was introduced
 * @param {object} config - Config object
 * @returns {string} - GitHub blob link
 */
module.exports = function generateBlobLink (context, file, contents, title, sha, config) {
  const repo = context
  const org = context
  const index = contents.indexOf(`${config.keyword} ${title}`)
  const tempString = contents.substring(0, index)
  const start = tempString.split('\n').length
  const end = start + config.blobLines
  return `https://github.com/${org}/${repo}/blob/${sha}/${file}#L${start}-L${end}`
}
