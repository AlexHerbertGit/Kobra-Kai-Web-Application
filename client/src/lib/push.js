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
  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
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

  try {
    const registrationCandidate = await Promise.race([
      pollForRegistration,
       ...registrationCandidates,
      new Promise((_, reject) => {
        timeoutId = window.setTimeout(() => {
          reject(new Error('Service worker did not become ready in time.'));
        }, timeoutMs);
      }),
    ]);

    const registration =
      registrationCandidate || (await navigator.serviceWorker.getRegistration());

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

  if (!registration.active) {
    let timeoutId;
    try {
      const readyPromise = navigator.serviceWorker.ready.then((readyRegistration) => {
        window.clearTimeout(timeoutId);
        return readyRegistration;
      });

      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = window.setTimeout(() => {
          reject(new Error('Service worker did not become ready in time.'));
        }, 5000);
      });

      registration = await Promise.race([readyPromise, timeoutPromise]);
    } finally {
      window.clearTimeout(timeoutId);
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
};