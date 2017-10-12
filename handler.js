// Webpack setup
const fs = require('fs')
const todo = require('.')

// eslint-disable-next-line
require('file-loader?name=private-key.pem!./private-key.pem')
const cert = fs.readFileSync('./private-key.pem', 'utf8')

// Probot setup
const createProbot = require('./probot')
const probot = createProbot({
  cert,
  id: process.env.APP_ID,
  secret: process.env.WEBHOOK_SECRET,
  port: 0
})

// Load Probot application
probot.load(todo)

// Lambda Handler
module.exports.todo = (event, context, callback) => {
  // Determine incoming webhook event type
  // Checking for different cases since node's http server is lowercasing everything
  const e = event.headers['x-github-event'] || event.headers['X-GitHub-Event']

  // Convert the payload to an Object if API Gateway stringifies it
  event.body = (typeof event.body === 'string') ? JSON.parse(event.body) : event.body

  try {
    probot.receive({
      event: e,
      payload: event.body
    })
    .then(() => {
      const res = {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Executed'
        })
      }
      callback(null, res)
    })
  } catch (err) {
    console.error(err)
    callback(err)
  }
}
