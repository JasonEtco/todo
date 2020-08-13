const fs = require('fs')
const path = require('path')

exports.loadDiff = filename => fs.readFileSync(path.join(__dirname, 'fixtures', 'diffs', filename + '.txt'), 'utf8')
exports.loadConfig = filename => fs.readFileSync(path.join(__dirname, 'fixtures', 'configs', filename + '.yml'), 'base64')
