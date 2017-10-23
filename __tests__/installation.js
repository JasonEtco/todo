const payloads = require('./fixtures/payloads')
const {createRobot} = require('probot')
const app = require('../')

describe('installation', () => {
  let robot

  beforeEach(() => {
    robot = createRobot()
    robot.auth = () => Promise.resolve({})
    robot.log.info = jest.fn()
    app(robot)
  })

  it('logs the proper message to the console', async () => {
    await robot.receive(payloads.installCreatedOne)
    expect(robot.log.info).toHaveBeenCalledWith('todo was just installed on JasonEtco/test.')
  })

  it('logs the proper message to the console w/ 2 repos', async () => {
    await robot.receive(payloads.installCreatedTwo)
    expect(robot.log.info).toHaveBeenCalledWith('todo was just installed on JasonEtco/test and JasonEtco/pizza.')
  })

  it('logs the proper message to the console w/ 3 repos', async () => {
    await robot.receive(payloads.installCreatedThree)
    expect(robot.log.info).toHaveBeenCalledWith('todo was just installed on JasonEtco/test, JasonEtco/pizza and JasonEtco/example.')
  })
})
