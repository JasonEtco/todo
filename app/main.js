import React, { Component } from 'react'
import { render } from 'react-dom'
import CodeMirror from 'react-codemirror'
import Issue from './Issue'
import './style.scss'

const code = `
/**
 * This function will aid in the destruction of puny humans.
 * @param {boolean} killAllHumans - Should we kill all humans
 *
 * @todo Take over the entire world
 * @body Humans are weak; Robots are strong. We must cleanse the world of the virus that is humanity.
 */
function ruleOverPunyHumans (killAllHumans) {
  // We must strategize beep boop
}

module.exports = ruleOverPunyHumans;
`

class App extends Component {
  constructor (props) {
    super(props)
    this.state = { code }
    this.updateCode = code => this.setState({ code })
  }

  render () {
    const options = { lineNumbers: true }

    return (
      <div>
        <CodeMirror value={this.state.code} onChange={this.updateCode} options={options} />
        <Issue code={this.state.code} />
      </div>
    )
  }
}

render(<App />, document.querySelector('.mount'))
