import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './state/AuthContext.jsx';
import { registerSW } from 'virtual:pwa-register';
import './App.css';

let resolveServiceWorkerRegistration;
let rejectServiceWorkerRegistration;

export const serviceWorkerRegistrationPromise =
  typeof window !== 'undefined' && 'serviceWorker' in navigator
    ? new Promise((resolve, reject) => {
        resolveServiceWorkerRegistration = resolve;
        rejectServiceWorkerRegistration = reject;
      })
    : Promise.reject(new Error('Service workers are not supported in this browser.'));

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker
    .getRegistration()
    .then((registration) => {
      if (registration) {
        resolveServiceWorkerRegistration?.(registration);
      }
    })
    .catch(() => {
      // Ignore lookup errors; registration attempts below will surface failures.
    });

  navigator.serviceWorker.ready
    .then((registration) => {
      resolveServiceWorkerRegistration?.(registration);
    })
    .catch(() => {
      // ready() only rejects on unusual failures which will surface via registerSW.
    });

  registerSW({
    immediate: true,
    onRegistered(registration) {
      if (registration) {
        resolveServiceWorkerRegistration?.(registration);
      }
    },
    onRegisterError(error) {
      console.error('Service worker registration failed', error);
      rejectServiceWorkerRegistration?.(error);
    },
  });
} else {
  registerSW({ immediate: true });
}

const rootElement = document.getElementById('root');
const ROOT_KEY = '__kobraKaiRoot__';

if (!rootElement) {
  throw new Error('Root element not found.');
}

let root = window[ROOT_KEY];

if (!root) {
  root = createRoot(rootElement);
  window[ROOT_KEY] = root;
}

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
