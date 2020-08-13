const fs = require('fs')
const path = require('path')

exports.loadDiff = filename => {
  return Promise.resolve({
    data: fs.readFileSync(path.join(__dirname, 'fixtures', 'diffs', filename + '.txt'), 'utf8'),
    headers: { 'content-length': 1 }
  })
}

exports.loadConfig = filename => fs.readFileSync(path.join(__dirname, 'fixtures', 'configs', filename + '.yml'))
