import { Router } from 'express';
import { body } from 'express-validator';
import { requireAuth } from '../middleware/auth.js';
import { getCurrentUser, updateCurrentUser } from '../controllers/userController.js';

const router = Router();

router.use(requireAuth);

router.get('/me', getCurrentUser);

router.patch('/me',
  body('name').optional().isString().isLength({ min: 2 }).trim(),
  body('address').optional().isString().isLength({ min: 10 }).trim(),
  updateCurrentUser
);

export default router;