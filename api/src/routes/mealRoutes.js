import { Router } from 'express';
import { body } from 'express-validator';
import { listMeals, createMeal, updateMeal, deleteMeal } from '../controllers/mealController.js';
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
  body('qtyAvailable').isInt({ min: 0 }).toInt(),
  body('tokenValue').isInt({ min: 0 }).toInt(),
  createMeal
);

// PUT Meal
router.put('/:id',
  requireAuth, requireRole('member', 'admin'),
  body('title').optional().isString().isLength({ min: 2 }),
  body('description').optional().isString(),
  body('dietaryTags').optional().isArray(),
  body('qtyAvailable').optional().isInt({ min: 0 }).toInt(),
  body('tokenValue').optional().isInt({ min: 0 }).toInt(),
  updateMeal
);

// DELETE Meal
router.delete('/:id',
  requireAuth, requireRole('member', 'admin'),
  deleteMeal
);


export default router;