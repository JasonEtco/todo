const React = require('react')
const ReactDOMServer = require('react-dom/server')
const fs = require('fs')
const path = require('path')
const App = require('../dist/server.min.js').default
const ssrTemplate = require('./ssr-template')

const ssrStr = ReactDOMServer.renderToString(React.createElement(App))
const html = ssrTemplate(ssrStr)

fs.writeFileSync(path.join(__dirname, '..', 'dist', 'index.html'), html, 'utf8')
