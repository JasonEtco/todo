/* eslint-disable jsx-quotes */

import React, { Component } from 'react'
import CodeMirror from 'react-codemirror'

export default class Blob extends Component {
  constructor (props) {
    super(props)
    this.splitCode = this.splitCode.bind(this)
  }

  componentDidUpdate () {
    const { code, start, cfg } = this.props
    if (this.editor) {
      this.editor.getCodeMirror().doc.setValue(this.splitCode(code, start, cfg.blobLines))
    }
  }

  splitCode (code, start, blobLines) {
    return code.split('\n').slice(start - 1, start + blobLines).join('\n')
  }

  render () {
    const {start, code, sha, cfg} = this.props
    if (cfg.blobLines === 0 || cfg.blobLines === false) return null

    const options = {
      firstLineNumber: start,
      lineNumbers: true,
      mode: 'javascript',
      readOnly: 'nocursor'
    }

    return ([<hr key={0} />,
      <div key={1} className="border rounded-1 my-2">
        <div className="f6 px-3 py-2 lh-condensed border-bottom bg-gray-light">
          <p className="mb-0 text-bold">
            <a href="#">robot-plan/index.js</a>
          </p>
          <p className="mb-0 text-gray-light">
            Lines {start} to {start + cfg.blobLines} in <a href="#" className="commit-tease-sha">{sha}</a>
          </p>
        </div>
        <CodeMirror ref={r => { this.editor = r }} value={this.splitCode(code, start, cfg.blobLines)} options={options} />
      </div>
    ])
  }
}
