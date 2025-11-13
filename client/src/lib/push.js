import { API_BASE_URL } from './api.js';
import { serviceWorkerRegistrationPromise } from '../main.jsx';

class TimeoutError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TimeoutError';
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

function withTimeout(promise, timeoutMs) {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    return promise;
  }

  return new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      reject(new TimeoutError('Operation timed out.'));
    }, timeoutMs);

    promise
      .then((value) => {
        window.clearTimeout(timeoutId);
        resolve(value);
      })
      .catch((error) => {
        window.clearTimeout(timeoutId);
        reject(error);
      });
  });
}

async function waitForServiceWorkerRegistration({ timeoutMs = 20000, pollIntervalMs = 300 } = {}) {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service workers are not available.');
  }

  const startTime = Date.now();

  const remainingTimeout = () => timeoutMs - (Date.now() - startTime);

  const immediateRegistration = await navigator.serviceWorker.getRegistration();
  if (immediateRegistration) {
    return immediateRegistration;
  }

  const registrationCandidates = [];

  if (serviceWorkerRegistrationPromise && typeof serviceWorkerRegistrationPromise.then === 'function') {
    registrationCandidates.push(serviceWorkerRegistrationPromise);
  }

  registrationCandidates.push(navigator.serviceWorker.ready);

  for (const candidate of registrationCandidates) {
    if (remainingTimeout() <= 0) {
      break;
    }

    try {
      const registration = await withTimeout(candidate, remainingTimeout());
      if (registration) {
        return registration;
      }

    } catch (error) {
      if (!(error instanceof TimeoutError)) {
        console.warn('Service worker candidate failed to resolve.', error);
      }
    }
  }
  while (remainingTimeout() > 0) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      return registration;
    }
    await new Promise((resolve) => {
      window.setTimeout(resolve, pollIntervalMs);
    });
  }
    throw new Error('Service worker registration was not found in time.');
}

let cachedVapidKey = null;
let vapidKeyLookupPromise = null;

async function fetchVapidKeyFromApi() {
  try {
    const response = await fetch(`${API_BASE_URL}/push/public-key`, { credentials: 'include' });
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    const key = typeof data?.key === 'string' ? data.key.trim() : '';
    if (!key) {
      throw new Error('Response did not include a VAPID public key.');
    }

    return key;
  } catch (error) {
    console.error('Failed to retrieve the VAPID public key from the API.', error);
    throw new Error('VAPID public key is not configured.');
  }
}

async function getVapidPublicKey() {
  if (cachedVapidKey) {
    return cachedVapidKey;
  }

  const envKey = typeof import.meta.env.VITE_VAPID_PUBLIC_KEY === 'string'
    ? import.meta.env.VITE_VAPID_PUBLIC_KEY.trim()
    : '';

  if (envKey) {
    cachedVapidKey = envKey;
    return cachedVapidKey;
  }

  if (!vapidKeyLookupPromise) {
    vapidKeyLookupPromise = fetchVapidKeyFromApi();
  }

  cachedVapidKey = await vapidKeyLookupPromise;
  return cachedVapidKey;
}

export async function subscribeToPush() {
  if (!('Notification' in window)) {
    throw new Error('Notifications are not supported in this browser.');
  }

  if (!('serviceWorker' in navigator)) {
    throw new Error('Service workers are not available.');
  }

  if (!('PushManager' in window)) {
    throw new Error('Push messaging is not supported in this browser.');
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Notification permission was not granted.');
  }

  const existingRegistration = await waitForServiceWorkerRegistration();
  if (!existingRegistration) {
    throw new Error('No service worker registration is available.');
  }

  let registration = existingRegistration;

  if (!registration.active && 'serviceWorker' in navigator) {
    try {
      const readyRegistration = await navigator.serviceWorker.ready;
      if (readyRegistration) {
        registration = readyRegistration;
      }
    } catch (error) {
      console.warn('Service worker was not ready yet; continuing with existing registration.', error);
    }
  }

  const existingSubscription = await registration.pushManager.getSubscription();
  if (existingSubscription) {
    return existingSubscription.toJSON();
  }

  const vapidKey = await getVapidPublicKey();
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidKey),
  });

  return subscription.toJSON();
}