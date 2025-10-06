import { Router } from 'express';
import { body } from 'express-validator';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { placeOrder, acceptOrder, listOrders } from '../controllers/orderController.js';

const router = Router();

// GET Orders
router.get('/', requireAuth, listOrders);

// POST New Order (Beneficiary)
router.post('/',
  requireAuth, requireRole('beneficiary'),
  body('mealId').isMongoId(),
  placeOrder
);

// POST Accept Order (Member)
router.post('/:id/accept',
  requireAuth, requireRole('member', 'admin'),
  acceptOrder
);

export default router;