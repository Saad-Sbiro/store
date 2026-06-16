// ─────────────────────────────────────────────
// FILE: src/main.jsx
// ─────────────────────────────────────────────

import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource/prociono'; // Prociono — serif blackletter display
import App from './App';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
