/**
 * Get the contents of a file
 * @param {object} context - Probot context object
 * @param {string} file - File name
 * @returns {Promise<string>}
 */
module.exports = async function getContents (context, file) {
  const {data} = await context.github.repos.getContent(context.repo({
    path: file,
    ref: context.payload.after
  }))

  const decoded = await Buffer.from(data.content, 'base64').toString()
  return decoded
}
