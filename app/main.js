/* eslint-disable jsx-quotes */

import React, { Component } from 'react'
import { render } from 'react-dom'
import CodeMirror from 'react-codemirror'
import 'codemirror/mode/javascript/javascript'

import Issue from './Issue'
import './style.scss'
import c from './constants'

function generateStartLine (contents, title) {
  const index = contents.indexOf(`${c.cfg.keyword} ${title}`)
  const tempString = contents.substring(0, index)
  const start = tempString.split('\n').length
  return start
}

class App extends Component {
  constructor (props) {
    super(props)
    this.state = { code: c.code }
    this.updateCode = code => this.setState({ code })
    this.getDetails = this.getDetails.bind(this)
  }

  getDetails () {
    const { code } = this.state
    const titleRe = new RegExp(`${c.cfg.keyword}\\s(.*)`, c.cfg.caseSensitive ? 'g' : 'gi')
    const matches = code.match(titleRe)

    if (matches) {
      const title = matches[0].replace(`${c.cfg.keyword} `, '')

      const bodyRe = new RegExp(`${title}\n.*@body (.*)`, 'gim')
      const bodyMatches = bodyRe.exec(code)
      const body = bodyMatches ? bodyMatches[1] : ''
      const start = generateStartLine(code, title)

      return { title, body, start }
    }

    return { title: false }
  }

  render () {
    const options = { lineNumbers: true, mode: 'javascript' }
    const {title, body, start} = this.getDetails()

    return (
      <div className="d-block d-lg-flex gutter-lg width-full">
        <div className="col-12 col-lg-6">
          <div className="border rounded-1 height-full">
            <CodeMirror value={this.state.code} onChange={this.updateCode} options={options} />
          </div>
        </div>
        <div className="col-12 col-lg-6">
          <div className="p-4 p-lg-0">
            <Issue title={title} body={body} start={start} code={c.code} />
          </div>
        </div>
      </div>
    )
  }
}

render(<App />, document.querySelector('.mount'))
