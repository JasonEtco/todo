/**
 * Generate an array of labels based on the config
 * @param {import('probot').Context} context - Probot context object
 * @param {object} cfg - Config object
 */
module.exports = async (context, cfg) => {
  if (typeof cfg.label === 'string') {
    return [cfg.label]
  } else if (Array.isArray(cfg.label)) {
    return cfg.label
  } else {
    if (cfg.label) {
      // Generate a label object
      const newLabel = context.repo({
        name: 'todo :spiral_notepad:',
        color: '00B0D8',
        request: { retries: 0 }
      })

      // This will catch if the label already exists
      try {
        await context.github.issues.createLabel(newLabel)
      } catch (e) {}

      return [newLabel.name]
    } else {
      return []
    }
  }
}
