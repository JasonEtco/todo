const getContents = require('./get-file-contents')

/**
 * Loop through and organize commits, files and contents in a Map
 * @param {object} - Probot context object
 * @param {object[]} - Array of commits
 * @param {object} - Git Tree data response
 * @returns {Promise<Map<string, string>}
 */
module.exports = async (context, commits, tree) => {
  const commitsByFiles = new Map()
  for (let c = 0; c < commits.length; c++) {
    const commit = commits[c]
    const files = [...commit.added, ...commit.modified]
    const mappedFiles = new Map()

    for (let i = 0; i < tree.data.tree.length; i++) {
      const file = tree.data.tree[i]
      if (files.indexOf(file.path) !== -1) {
        const sliced = commits.slice(c + 1)

        if (sliced.every(com => com.modified.indexOf(file.path) === -1)) {
          const contents = await getContents(context, file.sha, file.path)
          mappedFiles.set(file.path, {
            contents,
            sha: file.sha
          })
          break
        }
      }
    }

    commitsByFiles.set(commit.id, mappedFiles)
  }

  return commitsByFiles
}
