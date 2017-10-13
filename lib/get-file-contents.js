/**
 * Get the contents of a file
 * @param {object} context - Probot context object
 * @param {string} sha - File sha
 * @param {string} path - File name
 * @returns {Promise<string>}
 */
module.exports = async function getContents (context, sha, path) {
  const {data} = await context.github.gitdata.getBlob(context.repo({path, sha}))
  const decoded = await Buffer.from(data.content, 'base64').toString()
  return decoded
}
