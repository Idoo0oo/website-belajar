import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Apply dark mode from localStorage before first render (avoids flash). Default to dark.
const savedMode = localStorage.getItem('darkMode');
const isDark = savedMode === null ? true : savedMode === 'true';
if (isDark) {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
