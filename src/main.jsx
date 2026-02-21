import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Console infection sequence
setTimeout(() => {
  console.clear();
  console.log('%c[SYSTEM]', 'color: #10b981; font-weight: bold;', 'Initializing...');
}, 100);

setTimeout(() => {
  console.log('%c[SYSTEM]', 'color: #10b981; font-weight: bold;', 'Loading modules...');
}, 300);

setTimeout(() => {
  console.log('%c[WARNING]', 'color: #f59e0b; font-weight: bold;', 'Unauthorized access detected');
}, 600);

setTimeout(() => {
  console.log('%c[ERROR]', 'color: #ef4444; font-weight: bold;', 'Security breach in progress...');
}, 900);

setTimeout(() => {
  console.log(
    '%c⚠ ACCESS DENIED ⚠',
    'font-size: 24px; font-weight: bold; color: #ef4444; text-shadow: 0 0 10px #ef4444;'
  );
}, 1200);

setTimeout(() => {
  console.log('%c', 'font-size: 1px;'); // spacing
  console.log(
    '%cJust kidding. You can look around.',
    'font-size: 13px; color: #6b7280; font-style: italic;'
  );
  console.log(
    '%cBut there\'s nothing interesting here. Really.',
    'font-size: 13px; color: #6b7280;'
  );
  console.log('%c', 'font-size: 1px;'); // spacing
}, 1500);

import { HashRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
