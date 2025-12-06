import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { initializePWA } from './utils/pwaUtils.js';

// Initialize all PWA features (Service Worker, Install Prompt, etc.)
initializePWA();

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App className="bg-gray-200" />
  </React.StrictMode>
);
