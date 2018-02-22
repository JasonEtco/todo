const prompt = require('prompt')
const GitHubAPI = require('github')
const pushHandler = require('../src/push-handler')

const schema = {
  properties: {
    owner: {
      pattern: /^[a-zA-Z\s\-]+$/,
      message: 'Name must be only letters, spaces, or dashes',
      required: true
    },
    repo: {
      pattern: /^[a-zA-Z\s\-]+$/,
      message: 'Name must be only letters, spaces, or dashes',
      required: true
    },
    sha: {
      required: true
    }
  }
}

prompt.message = ''
prompt.start()
prompt.get(schema, async (err, { owner, repo, sha }) => {
  if (err) console.error(err)

  const github = new GitHubAPI({})
  github.issues.create = (o) => console.log(o)

  const context = {
    id: 1,
    log: console.log,
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

  await pushHandler(context)
})