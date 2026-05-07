import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { ThemeProvider } from './context/ThemeContext'
import { MetadataProvider } from './context/MetadataContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <MetadataProvider>
        <App />
      </MetadataProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
