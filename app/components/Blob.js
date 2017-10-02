/* eslint-disable jsx-quotes */

import React, { Component } from 'react'
import CodeMirror from 'react-codemirror'
import 'codemirror/mode/javascript/javascript'

export default class Blob extends Component {
  constructor (props) {
    super(props)
    this.splitCode = this.splitCode.bind(this)
  }

  componentDidUpdate () {
    const { code, start } = this.props
    this.editor.getCodeMirror().doc.setValue(this.splitCode(code, start))
  }

  splitCode (code, start) {
    return code.split('\n').slice(start - 1, start + 5).join('\n')
  }

  render () {
    const {start, code, sha} = this.props
    const options = {
      firstLineNumber: start,
      lineNumbers: true,
      mode: 'javascript',
      readOnly: 'nocursor'
    }

    return (
      <div className="border rounded-1 my-2">
        <div className="f6 px-3 py-2 lh-condensed border-bottom bg-gray-light">
          <p className="mb-0 text-bold">
            <a href="#">robot-plan/index.js</a>
          </p>
          <p className="mb-0 text-gray-light">
            Lines {start} to {start + 5} in <a href="#" className="commit-tease-sha">{sha}</a>
          </p>
        </div>
        <CodeMirror ref={r => { this.editor = r }} value={this.splitCode(code, start)} options={options} />
      </div>
    )
  }
}
