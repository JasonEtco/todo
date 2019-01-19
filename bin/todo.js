#!/usr/bin/env node

const program = require('commander')
const chalk = require('chalk')
const octokit = require('@octokit/rest')()
const pushHandler = require('../lib/push-handler')
const pullRequestMergedHandler = require('../lib/pull-request-merged-handler')
const fs = require('fs')
const path = require('path')

program
  .option('-o, --owner <owner>', 'owner')
  .option('-r, --repo <repo>', 'repo')
  .option('-s, --sha <sha>', 'sha')
  .option('-p, --pr <PR>', 'pr')
  .option('-f, --file <file>', 'file')
  .parse(process.argv)

const issues = []
const { owner, repo, file } = program

if (file) {
  octokit.repos.getCommit = () => ({ data: fs.readFileSync(path.resolve(file), 'utf8') })
  octokit.gitdata.getCommit = () => ({ data: { parents: [] } })
}
octokit.issues.create = issue => issues.push(issue)
octokit.search.issues = () => ({ data: { total_count: 0 } })

let promise
if (program.sha) {
  let context = {
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
  promise = pushHandler(context)
} else {
  promise = getPull()
}

async function getPull () {
  let result = await octokit.pullRequests.get({owner, repo, number: program.pr})
  let context = {
    event: 'pull_request.closed',
    id: 1,
    log: console.log,
    config: (_, obj) => obj,
    repo: (o) => ({ owner, repo, ...o }),
    issue: (o) => ({ owner, repo, number: program.pr, ...o }),
    payload: {
      repository: {
        owner,
        name: repo,
        master_branch: 'master'
      },
      pull_request: result.data
    },
    github: octokit
  }
  return pullRequestMergedHandler(context)
}

promise.then(() => {
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
