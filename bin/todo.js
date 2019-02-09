#!/usr/bin/env node

const program = require('commander')
const chalk = require('chalk')
const GitHubAPI = require('@octokit/rest')
const pushHandler = require('../lib/push-handler')
const fs = require('fs')
const path = require('path')

const octokit = new GitHubAPI()

program
  .option('-o, --owner <owner>', 'owner')
  .option('-r, --repo <repo>', 'repo')
  .option('-s, --sha <sha>', 'sha')
  .option('-f, --file <file>', 'file')
  .parse(process.argv)

const issues = []
const { owner, repo, file } = program

if (file) {
  octokit.repos.getCommit = () => ({ data: fs.readFileSync(path.resolve(file), 'utf8') })
  octokit.gitdata.getCommit = () => ({ data: { parents: [] } })
}
octokit.issues.create = issue => issues.push(issue)
octokit.search.issuesAndPullRequests = () => ({ data: { total_count: 0 } })

const context = {
  event: 'push',
  id: 1,
  log: () => {},
  config: (_, obj) => obj,
  repo: (o) => ({ owner, repo, ...o }),
  payload: {
    ref: 'refs/heads/master',
    repository: {
      owner,
      name: repo,
      master_branch: 'master'
    },
    head_commit: {
      id: program.sha || 1,
      author: {
        username: owner
      }
    }
  },
  github: octokit
}

pushHandler(context)
  .then(() => {
    issues.forEach(issue => {
      console.log(chalk.gray('---'))
      console.log(chalk.gray('Title:'), chalk.bold(issue.title))
      console.log(chalk.gray('Body:\n'), issue.body)
      console.log(chalk.gray('---'))
    })
  })
  .catch(e => {
    if (e.code === 404) {
      console.error('That combination of owner/repo/sha could not be found.')
    } else {
      console.error(e)
    }
  })
