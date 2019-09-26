const generateAssignedTo = require('./generate-assigned-to')

/**
 * Get the file boundaries of the hunk
 * @param {import('parse-diff').Change} lastChange
 * @param {number} line
 * @param {number} [padding=2]
 * @returns {Boundaries}
 */
function getFileBoundaries (lastChange, line, padding = 2) {
  const end = Math.min(line + padding, lastChange.ln || lastChange.ln2)
  return { start: line, end }
}

/**
 * Prepares some details about the TODO
 * @param {object} params
 * @param {import('probot').Context} params.context
 * @param {import('parse-diff').Chunk} params.chunk
 * @param {object} params.config
 * @param {number} params.line
 * @returns {Details}
 */
module.exports = ({ context, chunk, config, line }) => {
  const number = context.payload.pull_request ? context.payload.pull_request.number : null

  let username, sha
  if (context.payload.head_commit) {
    // Get it from the head commit in this push
    username = context.payload.head_commit.author.username
    sha = context.payload.head_commit.id
  } else {
    // Get it from the head ref in this PR
    username = context.payload.pull_request.head.user.login
    sha = context.payload.pull_request.head.sha
  }

  // Generate a string that expresses who the issue is assigned to
  const assignedToString = generateAssignedTo(config.autoAssign, username, number)

  let range
  if (!config.blobLines) {
    // Don't show the blob
    range = false
  } else {
    const lastChange = chunk.changes[chunk.changes.length - 1]
    const { start, end } = getFileBoundaries(lastChange, line, config.blobLines)
    range = start === end ? `L${start}` : `L${start}-L${end}`
  }

  return {
    username,
    sha,
    assignedToString,
    number,
    range
  }
}

/**
 * @typedef {Object} Details
 * @prop {string} username
 * @prop {string} sha
 * @prop {string} assignedToString
 * @prop {number} number
 * @prop {string} range
 */

/**
 * @typedef {Object} Boundaries
 * @prop {number} start
 * @prop {number} end
 */
