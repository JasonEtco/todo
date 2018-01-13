/* eslint-disable jsx-quotes */

import React, { Component } from 'react'
import Issue from './Issue'
import c from '../constants'
import defaultConfig from '../default-config'
import CodeMirror from 'react-codemirror'
import yaml from 'js-yaml'

function generateStartLine (contents, title, keyword) {
  const index = contents.indexOf(`${keyword} ${title}`)
  const tempString = contents.substring(0, index)
  const start = tempString.split('\n').length
  return start
}

export default class Demo extends Component {
  constructor (props) {
    super(props)
    this.state = { code: c.code, config: c.config, cfg: c.cfg }
    this.getDetails = this.getDetails.bind(this)
    this.updateCode = code => this.setState({ code })
    this.updateConfig = config => {
      try {
        const cfg = yaml.safeLoad(config)
        this.setState({ config, cfg })
      } catch (e) {}
    }
  }

  getDetails () {
    const { code, cfg } = this.state
    const config = Object.assign({}, defaultConfig, this.state.cfg)
    const theOne = Array.isArray(cfg.keyword) ? cfg.keyword.find(keyword => {
      const titleRe = new RegExp(`${keyword}\\s(.*)`, config.caseSensitive ? 'g' : 'gi')
      return code.search(titleRe) > -1
    }) : cfg.keyword

    const titleRe = new RegExp(`${theOne}\\s(.*)`, config.caseSensitive ? 'g' : 'gi')
    const matches = code.match(titleRe)

    if (matches) {
      const title = matches[0].replace(`${theOne} `, '')

      const bodyRe = new RegExp(`${title}\n.*@body (.*)`, 'gim')
      const bodyMatches = bodyRe.exec(code)
      const body = bodyMatches ? bodyMatches[1] : ''
      const start = generateStartLine(code, title, theOne)

      return { title, body, start, theOne }
    }

    return { title: false }
  }

  render () {
    const options = { lineNumbers: true, mode: 'javascript' }
    const optionTwo = { lineNumbers: true, mode: 'yaml' }
    const {title, body, start, theOne} = this.getDetails()
    const config = Object.assign({}, defaultConfig, this.state.cfg)

    return (
      <div className="d-block d-lg-flex gutter-lg width-full">
        <div className="col-12 col-lg-6 d-flex flex-column">
          <div className="border rounded-1 mb-2">
            <CodeMirror value={this.state.config} onChange={this.updateConfig} options={optionTwo} />
          </div>
          <div className="border rounded-1 d-flex code">
            <CodeMirror value={this.state.code} onChange={this.updateCode} options={options} />
          </div>
        </div>
        <div className="col-12 col-lg-6">
          <div className="pt-2 p-lg-0">
            <Issue title={title} body={body} start={start} code={this.state.code} cfg={config} keyword={theOne} />
          </div>
        </div>
      </div>
    )
  }
}
