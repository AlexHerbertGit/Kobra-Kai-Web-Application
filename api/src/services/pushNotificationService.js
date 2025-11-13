import webPush from 'web-push';
import PushSubscription from '../models/PushSubscription.js';

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@example.com';

let pushConfigured = Boolean(vapidPublicKey && vapidPrivateKey);

if (pushConfigured) {
  try {
    webPush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  } catch (error) {
    console.error('Failed to configure web-push with provided VAPID keys.', error);
    pushConfigured = false;
  }
} else {
  console.warn('web-push VAPID keys are not fully configured. Notification delivery disabled.');
}

function normalizePayload(payload) {
  if (payload == null) {
    return '';
  }

  if (typeof payload === 'string') {
    return payload;
  }

  try {
    return JSON.stringify(payload);
  } catch (error) {
    console.error('Failed to serialize push notification payload. Falling back to empty string.', error);
    return '';
  }
}

export function isPushConfigured() {
  return pushConfigured;
}

export async function sendPushNotificationToUser(userId, payload, options = {}) {
  if (!userId) {
    return { status: 'invalid_user', results: [], delivered: 0 };
  }

  if (!pushConfigured) {
    return { status: 'not_configured', results: [], delivered: 0 };
  }

  const subscriptions = await PushSubscription.find({ user: userId });

  if (subscriptions.length === 0) {
    return { status: 'no_subscriptions', results: [], delivered: 0 };
  }

  const serializedPayload = normalizePayload(payload);
  const results = [];
  let delivered = 0;

  for (const subscription of subscriptions) {
    if (!subscription.keys?.auth || !subscription.keys?.p256dh) {
      results.push({
        endpoint: subscription.endpoint,
        status: 'skipped',
        reason: 'missing_keys',
      });
      continue;
    }

    try {
      await webPush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: {
            auth: subscription.keys.auth,
            p256dh: subscription.keys.p256dh,
          },
        },
        serializedPayload,
        options,
      );
      delivered += 1;
      results.push({ endpoint: subscription.endpoint, status: 'sent' });
    } catch (error) {
      if (error.statusCode === 404 || error.statusCode === 410) {
        await subscription.deleteOne();
        results.push({ endpoint: subscription.endpoint, status: 'removed' });
      } else {
        results.push({ endpoint: subscription.endpoint, status: 'failed', message: error.message });
      }
    }
  }

  return { status: 'completed', results, delivered };
}