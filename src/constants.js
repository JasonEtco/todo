export default {
  repo: 'https://github.com/JasonEtco/todo',
  app: 'https://github.com/apps/todo',
  code: `/**
 * This function will aid in the destruction of puny humans.
 * @param {boolean} killAllHumans - Should we kill all humans
 *
 * @todo Take over the entire world
 * @body Humans are weak; **Robots are strong**. We must cleanse the world of the virus that is humanity.
 */
function ruleOverPunyHumans (killAllHumans) {
  // We must strategize beep boop
}
 
module.exports = ruleOverPunyHumans;
`,
  sha: '45c96e1',
  cfg: {
    keyword: '@todo',
    caseSensitive: false,
    blobLines: 5,
    autoAssign: true
  },
  config: `# These are the available config settings.
keyword: ["@todo", "TODO:"] # string|string[]
caseSensitive: false        # boolean
blobLines: 5                # number|boolean, 0 or false to disable
autoAssign: true            # string|string[]|boolean
label: true                 # boolean|string|string[]
reopenClosed: true          # boolean`
}
