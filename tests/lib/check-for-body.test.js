const checkForBody = require('../../lib/utils/check-for-body')

describe('check-for-body', () => {
  let changes, config

  beforeEach(() => {
    changes = [{
      type: 'add',
      ln: 257,
      content: '+    // TODO: A title'
    }, {
      type: 'add',
      ln: 258,
      content: '+    // BODY: A body'
    }]

    config = {
      bodyKeyword: 'BODY'
    }
  })

  it('returns the body if its present', () => {
    const actual = checkForBody(changes, 0, config)
    expect(actual).toBe('A body')
  })

  it('returns false if there is no next line', () => {
    const actual = checkForBody([changes[0]], 0, config)
    expect(actual).toBe(false)
  })

  it('returns false if the next line does not have a body', () => {
    changes = [
      changes[0],
      { content: '+    // PIZZA' }
    ]

    const actual = checkForBody(changes, 0, config)
    expect(actual).toBe(false)
  })

  it('allows for multiple keywords', () => {
    config.bodyKeyword = ['PIZZA', 'text']

    changes[1].content = '// PIZZA This is a pizza'
    const pizza = checkForBody(changes, 0, config)
    expect(pizza).toBe('This is a pizza')

    changes[1].content = '// text This is a test'
    const text = checkForBody(changes, 0, config)
    expect(text).toBe('This is a test')
  })

  it('Allows multiple consecutive BODY lines', () => {
    changes.push({
      type: 'add',
      ln: 259,
      content: '+    // BODY: Another body line'
    })
    const body = checkForBody(changes, 0, config)
    expect(body).toBe('A body Another body line')
  })

  it('Properly splits empty lines in multi-line BODY', () => {
    changes.push({
      type: 'add',
      ln: 259,
      content: '+    // BODY:'
    })
    changes.push({
      type: 'add',
      ln: 260,
      content: '+    // BODY: Test'
    })
    const body = checkForBody(changes, 0, config)
    expect(body).toBe('A body\nTest')
  })
})
