#!/usr/bin/env node

const program = require('commander')
const chalk = require('chalk')
const GitHubAPI = require('github')
const pushHandler = require('../src/push-handler')

program
  .option('-o, --owner <owner>', 'owner')
  .option('-r, --repo <repo>', 'repo')
  .option('-s, --sha <sha>', 'sha')
  .parse(process.argv)

const issues = []
const github = new GitHubAPI({})
github.issues.create = issue => issues.push(issue)
github.search.issues = () => ({ data: { total_count: 0 } })

const { owner, repo, sha } = program

const context = {
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
      id: sha,
      author: {
        username: owner
      }
    }
  },
  github
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
