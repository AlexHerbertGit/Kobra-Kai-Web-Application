import { Router } from 'express';
import { body } from 'express-validator';
import { requireAuth } from '../middleware/auth.js';
import { subscribe, unsubscribe, sendTestNotification } from '../controllers/pushController.js';

const router = Router();

router.get('/public-key', (_req, res) => {
  res.json({ key: process.env.VAPID_PUBLIC_KEY || '' });
});

router.post('/subscribe',
  requireAuth,
  body('endpoint').isString().trim().notEmpty(),
  body('keys').isObject(),
  body('keys.p256dh').isString().notEmpty(),
  body('keys.auth').isString().notEmpty(),
  body('expirationTime').optional({ nullable: true }).isNumeric().toFloat(),
  body('device').optional({ nullable: true }).isString().isLength({ max: 120 }),
  subscribe
);

router.delete('/subscribe',
  requireAuth,
  body('endpoint').optional({ checkFalsy: true }).isString(),
  async (req, res, next) => {
    if (!req.body?.endpoint && req.query?.endpoint) {
      req.body.endpoint = String(req.query.endpoint);
    }
    next();
  },
  unsubscribe
);

router.post('/notify',
  requireAuth,
  body('title').optional().isString().isLength({ max: 120 }),
  body('message').optional().isString().isLength({ max: 500 }),
  body('url').optional().isString().isLength({ max: 500 }),
  sendTestNotification
);

export default router;