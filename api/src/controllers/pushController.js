import { validationResult } from 'express-validator';
import PushSubscription from '../models/PushSubscription.js';

import { isPushConfigured, sendPushNotificationToUser } from '../services/pushNotificationService.js';

function normalizeExpiration(expirationTime) {
  if (expirationTime === null || expirationTime === undefined) {
    return null;
  }

  const numericExpiration =
    typeof expirationTime === 'number' && Number.isFinite(expirationTime)
      ? expirationTime
      : Number(expirationTime);

  if (!Number.isFinite(numericExpiration)) {
    return null;
  }

  const expirationDate = new Date(numericExpiration);
  return Number.isNaN(expirationDate.getTime()) ? null : expirationDate;
}

export async function subscribe(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { endpoint, keys, expirationTime, device } = req.body ?? {};
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!endpoint || typeof endpoint !== 'string') {
    return res.status(400).json({ message: 'A valid subscription endpoint is required.' });
  }

  const trimmedEndpoint = endpoint.trim();

  if (!keys || typeof keys !== 'object') {
    return res.status(400).json({ message: 'Push subscription keys are required.' });
  }

  const sanitizedKeys = {
    p256dh: typeof keys.p256dh === 'string' ? keys.p256dh.trim() : '',
    auth: typeof keys.auth === 'string' ? keys.auth.trim() : '',
  };

  if (!sanitizedKeys.p256dh || !sanitizedKeys.auth) {
    return res.status(400).json({ message: 'Push subscription keys are invalid.' });
  }

  const sanitizedDevice =
    typeof device === 'string' && device.trim().length > 0 ? device.trim() : null;

  const expiresAt = normalizeExpiration(expirationTime);

  try {
    const subscription = await PushSubscription.findOneAndUpdate(
      { user: userId, endpoint: trimmedEndpoint },
      {
        $set: {
          user: userId,
          endpoint: trimmedEndpoint,
          keys: sanitizedKeys,
          device: sanitizedDevice,
          userAgent: req.headers['user-agent'] || null,
          expiresAt,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
    );

    return res.status(201).json({
      id: subscription._id.toString(),
      endpoint: subscription.endpoint,
      device: subscription.device,
      expiresAt: subscription.expiresAt,
    });
  } catch (error) {
    console.error('Failed to persist push subscription.', error);
    return res.status(500).json({ message: 'Failed to save push subscription.' });
  }
}

export async function unsubscribe(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const endpoint = typeof req.body?.endpoint === 'string' ? req.body.endpoint.trim() : '';
  if (!endpoint) {
    return res.status(400).json({ message: 'A subscription endpoint is required.' });
  }

  await PushSubscription.findOneAndDelete({ user: userId, endpoint });

  return res.status(204).end();
}

export async function sendTestNotification(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!isPushConfigured()) {
    return res.status(503).json({ message: 'Push notifications are not configured on the server.' });
  }

  const { title, message, url } = req.body;
  const payload = {
    title: title || 'Kobra Kai',
    body: message || 'Push notifications are working!',
    data: {
      
  
    url: url || undefined,
    },
  };

  const { status, results } = await sendPushNotificationToUser(userId, payload);

  if (status === 'no_subscriptions') {
    return res.status(404).json({ message: 'No subscriptions found for this user.' });
  }
  res.json({ results });
}