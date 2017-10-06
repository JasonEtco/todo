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
  const {repo, owner} = context.repo()
  const lines = contents.split('\n')
  const totalLines = lines.length
  const start = lines.findIndex(line => line.includes(`${config.keyword} ${title}`)) + 1
  let end = start + config.blobLines

  // If the proposed end of range is past the last line of the file
  // make the end the last line of the file.
  if (totalLines < end) {
    end = totalLines
  }

  let range = `L${start}-L${end}`

  // Cut off blob line if the issue-to-be is on the last line
  if (totalLines === start || config.blobLines === 1) {
    range = `L${start}`
  }

  return `https://github.com/${owner}/${repo}/blob/${sha}/${file}#${range}`
}
