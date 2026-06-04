import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Apply dark mode from localStorage before first render (avoids flash)
const savedDark = localStorage.getItem('darkMode') === 'true';
if (savedDark) {
  document.documentElement.classList.add('dark');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
