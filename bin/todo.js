#!/usr/bin/env node

const program = require('commander')
const chalk = require('chalk')
const { GitHubAPI } = require('probot/lib/github')
const pushHandler = require('../lib/push-handler')
const pullRequestMergedHandler = require('../lib/pull-request-merged-handler')
const fs = require('fs')
const path = require('path')

const github = new GitHubAPI()

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
  github.repos.getCommit = () => ({ data: fs.readFileSync(path.resolve(file), 'utf8') })
  github.gitdata.getCommit = () => ({ data: { parents: [] } })
}

github.issues.create = issue => issues.push(issue)
github.search.issuesAndPullRequests = () => ({ data: { total_count: 0 } })

const shared = {
  github,
  id: 1,
  log: console.log,
  config: (_, obj) => obj,
  repo: (o) => ({ owner, repo, ...o }),
  payload: {
    repository: {
      owner,
      name: repo,
      master_branch: 'master'
    }
  }
}

async function getPush () {
  return pushHandler({
    ...shared,
    event: 'push',
    payload: {
      ...shared.payload,
      ref: 'refs/heads/master',
      head_commit: {
        id: program.sha || 1,
        author: { username: owner }
      }
    }
  })
}

async function getPull () {
  const result = await github.pulls.get({owner, repo, number: program.pr})
  return pullRequestMergedHandler({
    ...shared,
    event: 'pull_request.closed',
    issue: (o) => ({ owner, repo, number: program.pr, ...o }),
    payload: {
      pull_request: result.data,
      ...shared.payload
    }
  })
}

(program.sha ? getPush() : getPull()).then(() => {
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
