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
      owner: { login: 'JasonEtco' }
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
      owner: { login: 'JasonEtco' }
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
      owner: { login: 'JasonEtco' }
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
      owner: { login: 'JasonEtco' }
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
      owner: { login: 'JasonEtco' }
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
      owner: { login: 'JasonEtco' }
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
