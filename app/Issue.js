import React, { Component } from 'react'

export default class Issue extends Component {
  render () {
    return (
      <div>
        <div id='partial-discussion-header' className='gh-header js-details-container Details js-socket-channel js-updatable-content issue' data-channel='issue:256873375' data-url='/JedWatson/react-codemirror/issues/129/show_partial?partial=issues%2Ftitle'>
          <div className='gh-header-show '>
            <h1 className='gh-header-title'>
              <span className='js-issue-title'>
                {this.props.title || 'Hello i am a title'}
              </span>
              <span className='gh-header-number'>#129</span>
            </h1>
          </div>
          <div className='TableObject gh-header-meta'>
            <div className='TableObject-item'>
              <div className='State State--green'>
                <svg aria-hidden='true' className='octicon octicon-issue-opened' height='16' version='1.1' viewBox='0 0 14 16' width='14'><path fillRule='evenodd' d='M7 2.3c3.14 0 5.7 2.56 5.7 5.7s-2.56 5.7-5.7 5.7A5.71 5.71 0 0 1 1.3 8c0-3.14 2.56-5.7 5.7-5.7zM7 1C3.14 1 0 4.14 0 8s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm1 3H6v5h2V4zm0 6H6v2h2v-2z' /></svg>
                Open
              </div>
            </div>
            <div className='TableObject-item TableObject-item--primary'>
              <a href='/todo' className='author'>todo <span className='bot-identifier'>bot</span></a> opened this issue just now · 0 comments
            </div>
          </div>
        </div>
      </div>
    )
  }
}
