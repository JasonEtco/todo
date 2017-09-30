exports.basic = {
  event: 'push',
  payload: {
    ref: 'refs/heads/master',
    commits: [
      {
        id: 'f7d286aa6381bbb5045288496403d9427b0746e2',
        author: { username: 'JasonEtco' },
        added: [],
        removed: [],
        modified: ['index.js']
      }
    ],
    head_commit: {
      id: 'f7d286aa6381bbb5045288496403d9427b0746e2',
      author: { username: 'JasonEtco' }
    },
    repository: {
      id: 98814489,
      name: 'test',
      full_name: 'JasonEtco/test',
      owner: {
        name: 'JasonEtco',
        login: 'JasonEtco'
      }
    },
    pusher: {
      name: 'JasonEtco',
      email: 'jasonetco@gmail.com'
    },
    installation: {
      id: 55850
    }
  }
}
