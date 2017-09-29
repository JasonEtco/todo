/**
 * Generate a blob link.
 * @param {string} file - File name
 * @param {string} contents - Contents of the file
 * @param {string} sha - Commit where this todo was introduced
 * @param {number} numLines - Number of lines
 */
module.exports = function generateBlobLink (context, file, contents, sha, numLines) {
  const repo = context
  const org = context
  const start = 10 // Get the actual line
  const end = start + numLines
  return `https://github.com/${org}/${repo}/blob/${sha}/${file}#L${start}-L${end}`
}
