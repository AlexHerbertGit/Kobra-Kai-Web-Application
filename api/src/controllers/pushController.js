import { validationResult } from 'express-validator';
import webPush from 'web-push';
import PushSubscription from '../models/PushSubscription.js';

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@example.com';

if (vapidPublicKey && vapidPrivateKey) {
  webPush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
} else {
  console.warn('web-push VAPID keys are not fully configured. Notification delivery disabled.');
}

export async function subscribe(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { endpoint, keys, expirationTime, device } = req.body;
  const sanitizedDevice = typeof device === 'string' ? device.trim() : null;
  const expiresAt = expirationTime === null || expirationTime === undefined
    ? null
    : new Date(expirationTime);

  const subscription = await PushSubscription.findOneAndUpdate(
    { user: req.user.id, endpoint },
    {
      $set: {
        user: req.user.id,
        endpoint,
        keys: {
          p256dh: keys.p256dh,
          auth: keys.auth
        },
        device: sanitizedDevice || null,
        userAgent: req.headers['user-agent'] || null,
        expiresAt
      }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.status(201).json({ id: subscription._id, endpoint: subscription.endpoint });
}

export async function unsubscribe(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { endpoint } = req.body;

  await PushSubscription.findOneAndDelete({ user: req.user.id, endpoint });

  res.status(204).end();
}

export async function sendTestNotification(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  if (!vapidPublicKey || !vapidPrivateKey) {
    return res.status(503).json({ message: 'Push notifications are not configured on the server.' });
  }

  const { title, message, url } = req.body;
  const subscriptions = await PushSubscription.find({ user: req.user.id });

  if (subscriptions.length === 0) {
    return res.status(404).json({ message: 'No subscriptions found for this user.' });
  }

  const payload = JSON.stringify({
    title: title || 'Kobra Kai',
    body: message || 'Push notifications are working!',
    url: url || undefined
  });

  const results = [];

  for (const subscription of subscriptions) {
    try {
      await webPush.sendNotification({
        endpoint: subscription.endpoint,
        keys: {
          auth: subscription.keys.auth,
          p256dh: subscription.keys.p256dh
        }
      }, payload);
      results.push({ endpoint: subscription.endpoint, status: 'sent' });
    } catch (err) {
      if (err.statusCode === 404 || err.statusCode === 410) {
        await subscription.deleteOne();
        results.push({ endpoint: subscription.endpoint, status: 'removed' });
      } else {
        results.push({ endpoint: subscription.endpoint, status: 'failed', message: err.message });
      }
    }
  }

  res.json({ results });
}