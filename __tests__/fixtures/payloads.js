exports.basic = {
  event: 'push',
  payload: {
    ref: 'refs/heads/master',
    commits: [
      {
        id: 'f7d286aa6381bbb5045288496403d9427b0746e2',
        added: [],
        removed: [],
        modified: ['index.js']
      }
    ],
    head_commit: {
      id: 'f7d286aa6381bbb5045288496403d9427b0746e2'
    },
    pusher: {
      name: 'JasonEtco'
    },
    repository: {
      name: 'test',
      owner: { login: 'JasonEtco' },
      default_branch: 'master'
    },
    installation: {
      id: 10000
    }
  }
}

exports.special = {
  event: 'push',
  payload: {
    ref: 'refs/heads/master',
    commits: [
      {
        id: 'f7d286aa6381bbb5045288496403d9427b0746e2',
        added: [],
        removed: [],
        modified: ['special.js']
      }
    ],
    head_commit: {
      id: 'f7d286aa6381bbb5045288496403d9427b0746e2'
    },
    pusher: {
      name: 'JasonEtco'
    },
    repository: {
      name: 'test',
      owner: { login: 'JasonEtco' },
      default_branch: 'master'
    },
    installation: {
      id: 10000
    }
  }
}

exports.pr = {
  event: 'push',
  payload: {
    ref: 'refs/heads/branch',
    commits: [
      {
        id: 'f7d286aa6381bbb5045288496403d9427b0746e2',
        added: [],
        removed: [],
        modified: ['index.js']
      }
    ],
    head_commit: {
      id: 'f7d286aa6381bbb5045288496403d9427b0746e2'
    },
    pusher: {
      name: 'JasonEtco'
    },
    repository: {
      name: 'test',
      owner: { login: 'JasonEtco' },
      default_branch: 'master'
    },
    installation: {
      id: 10000
    }
  }
}

exports.caseinsensitive = {
  event: 'push',
  payload: {
    ref: 'refs/heads/master',
    commits: [
      {
        id: 'f7d286aa6381bbb5045288496403d9427b0746e2',
        added: [],
        removed: [],
        modified: ['caseinsensitive.js']
      }
    ],
    head_commit: {
      id: 'f7d286aa6381bbb5045288496403d9427b0746e2'
    },
    pusher: {
      name: 'JasonEtco'
    },
    repository: {
      name: 'test',
      owner: { login: 'JasonEtco' },
      default_branch: 'master'
    },
    installation: {
      id: 10000
    }
  }
}

exports.configFile = {
  event: 'push',
  payload: {
    ref: 'refs/heads/master',
    commits: [
      {
        id: 'f7d286aa6381bbb5045288496403d9427b0746e2',
        added: [],
        removed: [],
        modified: ['.github/config.yml']
      }
    ],
    head_commit: {
      id: 'f7d286aa6381bbb5045288496403d9427b0746e2'
    },
    pusher: {
      name: 'JasonEtco'
    },
    repository: {
      name: 'test',
      owner: { login: 'JasonEtco' },
      default_branch: 'master'
    },
    installation: {
      id: 10000
    }
  }
}

exports.caseinsensitive = {
  event: 'push',
  payload: {
    ref: 'refs/heads/master',
    commits: [
      {
        id: 'f7d286aa6381bbb5045288496403d9427b0746e2',
        added: [],
        removed: [],
        modified: ['caseinsensitive.js']
      }
    ],
    head_commit: {
      id: 'f7d286aa6381bbb5045288496403d9427b0746e2'
    },
    pusher: {
      name: 'JasonEtco'
    },
    repository: {
      name: 'test',
      owner: { login: 'JasonEtco' },
      default_branch: 'master'
    },
    installation: {
      id: 10000
    }
  }
}

exports.many = {
  event: 'push',
  payload: {
    ref: 'refs/heads/master',
    commits: [
      {
        id: 'f7d286aa6381bbb5045288496403d9427b0746e2',
        added: [],
        removed: [],
        modified: ['many.js']
      }
    ],
    head_commit: {
      id: 'f7d286aa6381bbb5045288496403d9427b0746e2'
    },
    pusher: {
      name: 'JasonEtco'
    },
    repository: {
      name: 'test',
      owner: { login: 'JasonEtco' },
      default_branch: 'master'
    },
    installation: {
      id: 10000
    }
  }
}

exports.complex = {
  event: 'push',
  payload: {
    ref: 'refs/heads/master',
    commits: [
      {
        id: 'f7d286aa6381bbb5045288496403d9427b0746e2',
        added: [],
        removed: [],
        modified: ['index.js']
      },
      {
        id: 'q7d286aa6381bbb5045288496403d9427b0746e2',
        added: ['another.js'],
        removed: [],
        modified: []
      },
      {
        id: 's7d286aa6381bbb5045288496403d9427b0746e2',
        added: [],
        removed: [],
        modified: ['index.js']
      },
      {
        id: 's7d286aa6381bbb5045288496403d9427b0746e2',
        added: [],
        removed: [],
        modified: ['index.js']
      },
      {
        id: 's7d286aa6381bbb5045288496403d9427b0746e2',
        added: ['index.js'],
        removed: [],
        modified: []
      }
    ],
    head_commit: {
      id: 'f7d286aa6381bbb5045288496403d9427b0746e2'
    },
    pusher: {
      name: 'JasonEtco'
    },
    repository: {
      name: 'test',
      owner: { login: 'JasonEtco' },
      default_branch: 'master'
    },
    installation: {
      id: 10000
    }
  }
}

exports.merge = {
  event: 'push',
  payload: {
    commits: [],
    head_commit: null,
    repository: {
      name: 'todo',
      full_name: 'JasonEtco/todo',
      owner: {
        name: 'JasonEtco'
      }
    },
    pusher: {
      name: 'JasonEtco'
    },
    installation: {
      id: 10000
    }
  }
}

exports.pullRequestMerged = {
  event: 'pull_request',
  payload: {
    action: 'closed',
    number: 17,
    pull_request: {
      head: {
        sha: '856e2d80f9a00e440425efb94416dabf07edab0c'
      },
      merged: true,
      merged_by: {
        login: 'JasonEtco'
      }
    },
    repository: {
      name: 'todo',
      full_name: 'JasonEtco/todo',
      owner: {
        name: 'JasonEtco'
      }
    },
    installation: {
      id: 10000
    }
  }
}

exports.pullRequestClosed = {
  event: 'pull_request',
  payload: {
    action: 'closed',
    number: 5,
    pull_request: {
      merged: false
    },
    installation: {
      id: 10000
    }
  }
}

exports.installCreatedOne = {
  event: 'installation',
  payload: {
    action: 'created',
    installation: {
      id: 10000
    },
    repositories: [
      { full_name: 'JasonEtco/test' }
    ]
  }
}

exports.installCreatedTwo = {
  event: 'installation',
  payload: {
    action: 'created',
    installation: {
      id: 10000
    },
    repositories: [
      { full_name: 'JasonEtco/test' },
      { full_name: 'JasonEtco/pizza' }
    ]
  }
}

exports.installCreatedThree = {
  event: 'installation',
  payload: {
    action: 'created',
    installation: {
      id: 10000
    },
    repositories: [
      { full_name: 'JasonEtco/test' },
      { full_name: 'JasonEtco/pizza' },
      { full_name: 'JasonEtco/example' }
    ]
  }
}
