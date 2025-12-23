import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Global handler for unhandled promise rejections to help diagnose 'content.js' errors
window.addEventListener('unhandledrejection', (event) => {
  try {
    // Ignore errors originating from browser extensions (noisy and not actionable)
    const reason = event.reason || {};
    const stackOrMessage = (reason && (reason.stack || reason.message || '')) || '';
    const isExtensionError = (s) => {
      if (!s) return false;
      return s.includes('chrome-extension://') || s.includes('moz-extension://') || s.includes('abcbjgholdjcjblkibolbppb');
    };

    if (isExtensionError(stackOrMessage)) return;

    console.error('Unhandled promise rejection captured:', reason);
    // Persist a small record to localStorage to inspect later if needed
    const prev = JSON.parse(localStorage.getItem('__unhandled_rejections__') || '[]');
    prev.push({ time: new Date().toISOString(), reason: (reason && (reason.message || reason)) || reason });
    localStorage.setItem('__unhandled_rejections__', JSON.stringify(prev.slice(-20)));
    // Prevent the browser from logging the rejection again as 'Uncaught (in promise)'
    if (typeof event.preventDefault === 'function') {
      try { event.preventDefault(); } catch { /* ignore */ }
    }
  } catch {
    // ignore
  }
});

// Global handler for uncaught errors
window.addEventListener('error', (event) => {
  try {
    const err = event.error || {};
    const stackOrMessage = (err && (err.stack || err.message)) || event.message || '';
    const isExtensionError = (s) => {
      if (!s) return false;
      return s.includes('chrome-extension://') || s.includes('moz-extension://') || s.includes('abcbjgholdjcjblkibolbppb');
    };

    if (isExtensionError(stackOrMessage)) return;

    console.error('Global error captured:', err || event.message, event.filename, event.lineno, event.colno);
    const prev = JSON.parse(localStorage.getItem('__global_errors__') || '[]');
    prev.push({ time: new Date().toISOString(), message: event.message, filename: event.filename, lineno: event.lineno, colno: event.colno });
    localStorage.setItem('__global_errors__', JSON.stringify(prev.slice(-50)));
    // Prevent default browser handling which may also log the error
    if (typeof event.preventDefault === 'function') {
      try { event.preventDefault(); } catch { /* ignore */ }
    }
  } catch {
    // ignore
  }
});
