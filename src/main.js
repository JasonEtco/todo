import React from 'react'
import { render } from 'react-dom'

import 'codemirror/mode/javascript/javascript'
import 'codemirror/mode/yaml/yaml'
import App from './components/App'

render(<App />, document.querySelector('.mount'))
