const defaultConfig = require('./lib/default-config')
const getContents = require('./lib/get-file-contents')
const generateBody = require('./lib/generate-body')
const commitIsInPR = require('./lib/commit-is-in-pr')
const ssrTemplate = require('./lib/ssr-template')
const React = require('react')
const ReactDOMServer = require('react-dom/server')
const App = require('./public/server.min.js').default

const express = require('express')
const path = require('path')

module.exports = (robot) => {
  const app = robot.route('/')
  app.use(express.static(path.join(__dirname, 'public')))
  app.get('/', (req, res) => {
    const ssrStr = ReactDOMServer.renderToString(React.createElement(App))
    const tpl = ssrTemplate(ssrStr)

    if (process.env.NODE_ENV !== 'development') {
      res.set('Cache-Control', 'public, max-age=1200, s-maxage=3200')
    }

    res.end(tpl)
  })

  robot.on('push', async context => {
    const config = await context.config('config.yml')
    const cfg = {...defaultConfig, ...config.todo}

    // Get array of issue objects in the current repo
    const issues = await context.github.issues.getForRepo(context.repo())

    const {head_commit, commits} = context.payload
    const author = head_commit.author.username

    // Get the most up-to-date contents of each file
    // by the commit it was most recently edited in.
    const commitsByFiles = new Map()
    for (let c = 0; c < commits.length; c++) {
      const commit = commits[c]
      const files = [...commit.added, ...commit.modified]
      const mappedFiles = new Map()

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const sliced = commits.slice(c + 1)

        if (sliced.every(com => com.modified.indexOf(file) === -1)) {
          const contents = await getContents(context, commit.id, file)
          mappedFiles.set(file, contents)
        }
      }

      commitsByFiles.set(commit.id, mappedFiles)
    }

    commitsByFiles.forEach(async (files, sha) => {
      files.forEach(async (contents, file) => {
        // Get issue titles
        const re = new RegExp(`${cfg.keyword}\\s(.*)`, cfg.caseSensitive ? 'g' : 'gi')
        const matches = contents.match(re)
        if (!matches) return

        const titles = matches.map(title => title.replace(`${cfg.keyword} `, ''))
        titles.forEach(async title => {
          // Check if an issue with that title exists
          if (issues.data.some(issue => issue.title === title && issue.state === 'open')) return

          // :TODO: Reopen existing but closed issues if the same todo is introduced

          const pr = await commitIsInPR(context, sha)
          const body = generateBody(context, cfg, title, file, contents, author, sha, pr)

          // Generate an issue object
          // :TODO: Add labels

          const issueObj = { title, body }
          if (cfg.autoAssign === true) {
            issueObj.assignee = author
          } else if (typeof cfg.autoAssign === 'string') {
            issueObj.assignee = cfg.autoAssign
          } else if (Array.isArray(cfg.autoAssign)) {
            issueObj.assignees = cfg.autoAssign
          }

          const issue = context.issue(issueObj)

          return context.github.issues.create(issue)
        })
      })
    })
  })
}
