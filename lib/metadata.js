// Slightly modified from https://github.com/probot/metadata/

const regex = /\n\n<!-- probot = (.*) -->/

module.exports = (context, issue) => {
  const prefix = context.payload.installation.id

  return {
    get (key = null) {
      if (typeof issue.body === 'undefined') return null

      const match = issue.body.match(regex)

      if (match) {
        const data = JSON.parse(match[1])[prefix]
        return key ? data && data[key] : data
      }

      return null
    }
  }
}
