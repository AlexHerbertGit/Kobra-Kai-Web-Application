import { serviceWorkerRegistrationPromise } from '../main.jsx';

const VAPID_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

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

async function waitForServiceWorkerRegistration(timeoutMs = 5000) {
  let timeoutId;

  const registrationCandidates = [];

  if (
    serviceWorkerRegistrationPromise &&
    typeof serviceWorkerRegistrationPromise.then === 'function'
  ) {
    registrationCandidates.push(
      serviceWorkerRegistrationPromise.catch((error) => {
        throw error;
      }),
    );
  }

  if ('serviceWorker' in navigator) {
    registrationCandidates.push(
      navigator.serviceWorker.ready.catch((error) => {
        throw error;
      }),
    );
  }

  if (registrationCandidates.length === 0) {
    throw new Error('No service worker registration candidates are available.');
  }

  try {
    const registrationCandidate = await Promise.race([
       ...registrationCandidates,
      new Promise((_, reject) => {
        timeoutId = window.setTimeout(() => {
          reject(new Error('Service worker did not become ready in time.'));
        }, timeoutMs);
      }),
    ]);

    const registration =
      registrationCandidate ||
      ('serviceWorker' in navigator
        ? await navigator.serviceWorker.getRegistration()
        : null);

    if (!registration) {
      throw new Error('No service worker registration is available.');
    }

    return registration;
  } finally {
    window.clearTimeout(timeoutId);
  }
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

  if (!VAPID_KEY) {
    throw new Error('VAPID public key is not configured.');
  }

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_KEY),
  });

  return subscription.toJSON();
}