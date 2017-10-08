/* eslint-disable jsx-quotes */

import React, { Component } from 'react'
import Demo from './Demo'
import defaultConfig from '../default-config'

import '../style.scss'
import c from '../constants'

const configOptions = [{
  name: 'keyword',
  type: 'string'
}, {
  name: 'caseSensitive',
  type: 'boolean'
}, {
  name: 'blobLines',
  type: 'number|boolean'
}, {
  name: 'autoAssign',
  type: 'boolean|string|string[]'
}, {
  name: 'label',
  type: 'boolean|string|string[]'
}, {
  name: 'reopenClosed',
  type: 'boolean'
}]

export default class App extends Component {
  constructor (props) {
    super(props)
    this.installClick = this.installClick.bind(this)
  }

  installClick (e) {
    window.ga('send', 'event', {
      eventCategory: 'Outbound Link',
      eventAction: 'click',
      eventLabel: e.target.href,
      transport: 'beacon'
    })
  }

  render () {
    return ([
      <header key={0} className="header py-3 p-responsive text-center border-bottom d-md-block d-flex flex-justify-between flex-items-center">
        <h1 className="d-flex flex-items-center flex-justify-center"><img className="rounded-1 mr-2" src="https://avatars1.githubusercontent.com/in/5534?v=4&s=88" width="32" /> todo</h1>
        <a href={c.repo} className="text-inherit text-bold">Contribute on <svg className="octicon octicon-mark-github" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" /></svg></a>
      </header>,
      <div key={1}>
        <div className="container-md p-responsive py-6 mt-6 mb-5 text-center">
          <h2 className="alt-h2">Automatically generate new issues</h2>
          <p className="lead"><strong>todo</strong> is a GitHub App that automagically creates new issues based on comments and keywords in your code when you push it to GitHub. Check out the demo below.</p>
        </div>
        <div className="p-2 p-lg-4">
          <Demo />
        </div>

        <div className="border-top border-bottom bg-gray py-6 mt-4">
          <div className="container-md p-responsive text-center">
            <h2 className="alt-h2">Configure as needed</h2>
            <p className="lead">The app comes with a few configuration options built-in, to suit your project's needs.</p>

            <div className="markdown-body text-left">
              <div className="table-wrapper">
                <table className="d-table">
                  <thead><tr>
                    <th>Option</th>
                    <th>Type</th>
                    <th>Default Value</th>
                  </tr></thead>
                  <tbody className="input-monospace">
                    {configOptions.map(opt => (
                      <tr key={opt.name}>
                        <td>{opt.name}</td>
                        <td>{opt.type}</td>
                        <td>{String(defaultConfig[opt.name])}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-center f5 pb-2">Read more about the configuration options in the <a href={`${c.repo}#configuring-for-your-project`}>GitHub repo</a>.</p>
            </div>
          </div>
        </div>

        <div className="container-md p-responsive mt-4 py-6 text-center">
          <h2 className="alt-h2">Install it</h2>
          <p className="lead">You can install <strong>todo</strong> in your repos right now. Because its built on <a href="https://github.com/probot/probot">Probot</a>, it is a fully integrated GitHub App and works without any additional setup.</p>
          <a href={c.app} className="btn btn-primary btn-large f3" onClick={this.installClick}>Install <strong>todo</strong></a>
        </div>
      </div>,
      <footer key={2} className="mt-6 py-4 bg-gray-light border-top text-center">
        <p className="m-0">You can install <strong>todo</strong> in your repositories <a href={c.app}>right here.</a></p>
        <p className="mt-0 mb-1">Built by <a href="https://twitter.com/JasonEtco">@JasonEtco</a> with 🤖 using <a href="https://github.com/probot/probot">Probot</a>.</p>
      </footer>
    ])
  }
}
