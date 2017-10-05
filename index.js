const defaultConfig = require('./lib/default-config')
const getContents = require('./lib/get-file-contents')
const generateBody = require('./lib/generate-body')
const commitIsInPR = require('./lib/commit-is-in-pr')
const ssrTemplate = require('./lib/ssr-template')
const generateLabel = require('./lib/generate-label')
const metadata = require('./lib/metadata')
const React = require('react')
const ReactDOMServer = require('react-dom/server')
const App = require('./public/server.min.js').default

const express = require('express')
const path = require('path')

const ssrStr = ReactDOMServer.renderToString(React.createElement(App))
const tpl = ssrTemplate(ssrStr)

module.exports = (robot) => {
  const app = robot.route('/')
  app.use(express.static(path.join(__dirname, 'public')))
  app.get('/', (req, res) => {
    /* istanbul ignore next */
    if (process.env.NODE_ENV !== 'development') {
      res.setHeader('cache-control', 'public, max-age=1200, s-maxage=3200')
    }

    res.end(tpl)
  })

  robot.on('push', async context => {
    if (!context.payload.head_commit) return

    const config = await context.config('config.yml')
    const cfg = config && config.todo ? {...defaultConfig, ...config.todo} : defaultConfig

    const [issuePages, labels] = await Promise.all([
      context.github.paginate(context.github.issues.getForRepo(context.repo())),
      generateLabel(context, cfg)
    ])

    const issues = [].concat.apply([], issuePages.map(p => p.data))

    // Get array of issue objects in the current repo
    const {pusher, commits} = context.payload
    const author = pusher.name

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
          const issueExists = issues.some(issue => {
            if (!issue.body) return false
            const key = metadata(context, issue).get('title')
            return key === title
          })

          if (issueExists) return

          // :TODO: Reopen existing but closed issues if the same todo is introduced

          const pr = await commitIsInPR(context, sha)
          const body = generateBody(context, cfg, title, file, contents, author, sha, pr)

          const issueObj = { title, body, labels }
          if (cfg.autoAssign === true) {
            issueObj.assignee = author
          } else if (typeof cfg.autoAssign === 'string') {
            issueObj.assignee = cfg.autoAssign
          } else if (Array.isArray(cfg.autoAssign)) {
            issueObj.assignees = cfg.autoAssign
          }

          const issue = context.issue(issueObj)

          robot.log(`Creating issue: ${issue.title}, in ${context.repo().owner}/${context.repo().repo}`)
          return context.github.issues.create(issue)
        })
      })
    })
  })
}
