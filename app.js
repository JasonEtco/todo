const todo = require('.')
const createProbot = require('probot')
const cert = require('./private-key.pem')

// Create probot instance
const probot = createProbot({
  id: process.env.APP_ID,
  secret: process.env.WEBHOOK_SECRET,
  cert: cert
})

// Load probot application
probot.load(todo)

module.exports.probotHandler = (event, context, callback) => {
  // Check both cases because node's http server lowercases things
  const e = event.headers['x-github-event'] || event.headers['X-GitHub-Event']

  // Convert the payload to an Object if API Gateway stringifies it
  event.body = (typeof event.body === 'string') ? JSON.parse(event.body) : event.body

  try {
    probot.receive(e, {
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
