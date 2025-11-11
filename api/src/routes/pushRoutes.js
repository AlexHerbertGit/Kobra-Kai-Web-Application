import { Router } from 'express';
import { body } from 'express-validator';
import { requireAuth } from '../middleware/auth.js';
import { subscribe, unsubscribe, sendTestNotification } from '../controllers/pushController.js';

const router = Router();

router.post('/subscribe',
  requireAuth,
  body('endpoint').isString().trim().notEmpty(),
  body('keys').isObject(),
  body('keys.p256dh').isString().notEmpty(),
  body('keys.auth').isString().notEmpty(),
  body('expirationTime').optional({ nullable: true }).isInt().toInt(),
  body('device').optional({ nullable: true }).isString().isLength({ max: 120 }),
  subscribe
);

router.delete('/subscribe',
  requireAuth,
  body('endpoint').isString().trim().notEmpty(),
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