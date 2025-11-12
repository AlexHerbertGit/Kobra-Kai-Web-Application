import { Router } from 'express';
import { body } from 'express-validator';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { placeOrder, moveOrderToCurrent, completeOrder, listOrders } from '../controllers/orderController.js';

const router = Router();

// GET Orders
router.get('/', requireAuth, listOrders);

// POST New Order (Beneficiary)
router.post('/',
  requireAuth, requireRole('beneficiary'),
  body('mealId').isMongoId(),
  placeOrder
);

// POST Move Order to Current (Member)
router.post('/:id/current',
  requireAuth, requireRole('member', 'admin'),
  moveOrderToCurrent
);

// Legacy endpoint support for clients still calling /accept
router.post('/:id/accept',
  requireAuth, requireRole('member', 'admin'),
    moveOrderToCurrent
);

// POST Mark Order as Completed (Member/Beneficiary)
router.post('/:id/completed',
  requireAuth, requireRole('member', 'beneficiary', 'admin'),
  completeOrder
);


export default router;