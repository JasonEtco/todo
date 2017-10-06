const fs = require('fs')
const todo = require('.')
const createProbot = require('probot')

const cert = fs.readFileSync('private-key.pem', 'utf8')

// Create probot instance
const probot = createProbot({
  id: process.env.APP_ID,
  secret: process.env.WEBHOOK_SECRET,
  cert: cert,
  port: process.env.PORT
})

// Load probot application
probot.load(todo)

module.exports.probotHandler = (event, context, callback) => {
  // Check both cases because node's http server lowercases things
  const e = event.headers['x-github-event'] || event.headers['X-GitHub-Event']

  // Convert the payload to an Object if API Gateway stringifies it
  event.body = (typeof event.body === 'string') ? JSON.parse(event.body) : event.body

  try {
    probot.robot.webbook.emit(e, {
      event: e,
      id: event.headers['x-github-event'] || event.headers['X-GitHub-Event'],
      payload: event.body
    })

    const res = {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Executed'
      })
    }
    callback(null, res)
  } catch (err) {
    console.error(err)
    callback(err)
  }
}
