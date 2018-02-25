const createProbot = require('probot-ts')
const { bot } = require('./dist')

const settings = require('./env.json')
process.env.APP_NAME = 'todo'

const probot = createProbot(settings)

// Creates a Bunyan Stackdriver Logging client
const LoggingBunyan = require('@google-cloud/logging-bunyan')
const loggingBunyan = new LoggingBunyan()
probot.logger.addStream(loggingBunyan.stream())

probot.load(bot)

/**
 * Relay GitHub events to the bot
 */
exports.bot = (request, response) => {
  const event = request.get('x-github-event') || request.get('X-GitHub-Event')
  const id = request.get('x-github-delivery') || request.get('X-GitHub-Delivery')
  console.log(`Received event ${event}${request.body.action ? ('.' + request.body.action) : ''}`)
  if (event) {
    try {
      probot.receive({
        event: event,
        id: id,
        payload: request.body
      }).then(() => {
        response.send({
          statusCode: 200,
          body: JSON.stringify({
            message: 'Executed'
          })
        })
      })
    } catch (err) {
      console.error(err)
      response.sendStatus(500)
    }
  } else {
    console.error(request)
    response.sendStatus(400)
  }
}
