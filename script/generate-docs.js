const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const schema = require('../lib/utils/config-schema')

const START = '<!--DOC GENERATOR-->'
const END = '<!--ENDDOC GENERATOR-->'
const REG = new RegExp(`${START}[\\s\\S]+${END}`)

function expressArrayType (opt) {
  const items = opt.items
  return items.map(item => `${item.type}[]`)
}

function joinAlternatives (opt) {
  return opt.alternatives.map(a => serializeType(a)).join(', ')
}

function serializeType (opt) {
  switch (opt.type) {
    case 'alternatives':
      return joinAlternatives(opt)
    case 'array':
      return expressArrayType(opt)
    default:
      return opt.type
  }
}

function generateTable () {
  const describedSchema = schema.describe()

  const tableHeaders = '| Name | Type | Description | Default |'
  const separator = '|------|------|-------------|---------|'

  const rows = Object.keys(describedSchema.children).map(key => {
    const opt = describedSchema.children[key]
    const type = serializeType(opt)
    return `| \`${key}\` | \`${type}\` | ${opt.description} | \`${JSON.stringify(opt.flags.default).replace(/"/g, "'")}\` |`
  })

  return [tableHeaders, separator, ...rows].join('\n')
}

function updateReadme () {
  const pathToReadme = path.join(__dirname, '..', 'README.md')
  const contents = fs.readFileSync(pathToReadme, 'utf8')
  const table = generateTable()
  const newContents = contents.replace(REG, `${START}\n${table}\n${END}`)
  fs.writeFileSync(pathToReadme, newContents)
  console.log(chalk.green(chalk.bold('✨  README docs updated!')))
}

updateReadme()
