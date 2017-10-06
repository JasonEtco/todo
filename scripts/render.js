const React = require('react')
const ReactDOMServer = require('react-dom/server')
const fs = require('fs')
const path = require('path')
const App = require('../server.min.js').default
const ssrTemplate = require('./ssr-template')

const ssrStr = ReactDOMServer.renderToString(React.createElement(App))
const html = ssrTemplate(ssrStr)

fs.writeFileSync(path.join(__dirname, '..', 'index.html'), html, 'utf8')
