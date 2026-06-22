import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

const theme = localStorage.getItem('theme') || 'dark';
if (theme === 'light') {
  document.documentElement.classList.add('light-mode');
  document.body.style.background = '#f1f5f9';
  document.body.style.color = '#0f172a';
} else {
  document.body.style.background = '#080c1a';
  document.body.style.color = '#e2e8f0';
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
