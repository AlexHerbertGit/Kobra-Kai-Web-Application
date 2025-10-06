import { Router } from 'express';
import { body } from 'express-validator';
import { listMeals, createMeal, updateMeal } from '../controllers/mealController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// GET ALL Meals
router.get('/', listMeals);

// POST Meal
router.post('/',
  requireAuth, requireRole('member', 'admin'),
  body('title').isString().isLength({ min: 2 }),
  body('description').optional().isString(),
  body('dietaryTags').optional().isArray(),
  body('qtyAvailable').isInt({ min: 0 }),
  createMeal
);

// PUT Meal
router.put('/:id',
  requireAuth, requireRole('member', 'admin'),
  body('title').optional().isString().isLength({ min: 2 }),
  body('description').optional().isString(),
  body('dietaryTags').optional().isArray(),
  body('qtyAvailable').optional().isInt({ min: 0 }),
  updateMeal
);

export default router;