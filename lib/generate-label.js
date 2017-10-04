/**
 * Generate an array of labels based on the config
 * @param {object} context - Probot context object
 * @param {object} cfg - Config object
 */
module.exports = async (context, cfg) => {
  if (typeof cfg.label === 'string') {
    return [cfg.label]
  } else if (Array.isArray(cfg.label)) {
    return cfg.label
  } else {
    if (cfg.label) {
      // Generate an label object
      const newLabel = context.repo({name: 'todo', color: '00B0D8'})

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
