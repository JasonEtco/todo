const generateLabel = require('../../lib/utils/generate-label')

describe('generate-label', () => {
  let context

  beforeEach(() => {
    context = {
      repo: (obj) => ({
        owner: 'JasonEtco',
        repo: 'todo',
        ...obj
      }),
      github: {
        issues: {
          createLabel: jest.fn()
        }
      }
    }
  })

  it('calls github.createLabel()', async () => {
    const labels = await generateLabel(context, { label: true })
    expect(Array.isArray(labels)).toBe(true)
    expect(context.github.issues.createLabel).toHaveBeenCalledTimes(1)
  })

  it('returns an array of the default label name', async () => {
    const labels = await generateLabel(context, { label: true })
    expect(Array.isArray(labels)).toBe(true)
    expect(labels).toEqual(['todo :spiral_notepad:'])
  })

  it('returns an empty array with label: false', async () => {
    const labels = await generateLabel(context, { label: false })
    expect(Array.isArray(labels)).toBe(true)
    expect(labels.length).toEqual(0)
    expect(labels).toEqual([])
  })

  it('returns an array with the provided string', async () => {
    const label = 'I am a label'
    const labels = await generateLabel(context, { label })
    expect(Array.isArray(labels)).toBe(true)
    expect(labels.length).toEqual(1)
    expect(labels).toEqual([label])
  })

  it('returns an array with the provided array of strings', async () => {
    const labels = await generateLabel(context, { label: ['pizza', 'dog'] })
    expect(Array.isArray(labels)).toBe(true)
    expect(labels.length).toEqual(2)
    expect(labels).toEqual(['pizza', 'dog'])
  })
})
