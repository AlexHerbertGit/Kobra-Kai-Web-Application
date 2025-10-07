import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, me, logout } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// POST /register
router.post('/register',
  body('name').isString().isLength({ min: 2 }),
  body('address').isString().isLength({ min: 10}),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('role').optional().isIn(['beneficiary', 'member', 'admin']),
  register
);

// POST /login
router.post('/login',
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  login
);

// GET /me
router.get('/me', requireAuth, me);

// POST /logout
router.post('/logout', requireAuth, logout);

export default router;