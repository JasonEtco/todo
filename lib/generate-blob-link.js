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
  const regexFlags = config.caseSensitive ? 'g' : 'gi'
  const re = new RegExp(`${config.keyword}\\s${title}`, regexFlags)

  // Get total number of new lines
  const totalLines = contents.match(/\r\n|\r|\n/g).length + 1

  // Extract start of blob
  const blob = contents.slice(contents.search(re))

  // Split blob into new lines
  const blobLines = blob.split(/\r\n|\r|\n/)

  // Determine start by length of lines before and after blob
  const start = totalLines - blobLines.length + 1
  let end = start + config.blobLines

  // If the proposed end of range is past the last line of the file
  // make the end the last line of the file.
  if (totalLines < end) {
    end = totalLines - 1
  }

  let range = `L${start}-L${end}`

  // Cut off blob line if the issue-to-be should be cut off at the same line
  if (start === end || start === totalLines || config.blobLines === 1) {
    range = `L${start}`
  }

  const {repo, owner} = context.repo()
  return `https://github.com/${owner}/${repo}/blob/${sha}/${file}#${range}`
}
