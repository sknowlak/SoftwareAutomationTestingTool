import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import SimpleApp from './SimpleApp'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* Temporarily using SimpleApp for testing */}
      <SimpleApp />
      {/* <App /> */}
    </BrowserRouter>
  </React.StrictMode>,
)
