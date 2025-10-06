import { validationResult } from 'express-validator';
import Meal from '../models/Meal.js';

// listMeals Function - Pulls the meals stored in the database, creates a json object that is returned.
export async function listMeals(_req, res) {
  const meals = await Meal.find().sort({ createdAt: -1 }).lean();
  res.json(meals);
}

// creatMeal Function - Used by Member users to create meals using the frontend interface.
export async function createMeal(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { title, description, dietaryTags, qtyAvailable } = req.body;
  const meal = await Meal.create({
    memberId: req.user.id,
    title,
    description,
    dietaryTags: dietaryTags ?? [],
    qtyAvailable
  });
  res.status(201).json(meal);
}

// updateMeal Function - Used by Member users to update meal details, saves updated changes in the DB. 
export async function updateMeal(req, res) {
  const { id } = req.params;
  const meal = await Meal.findById(id);
  if (!meal) return res.status(404).json({ message: 'Meal not found' });
  if (meal.memberId.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

  const { title, description, dietaryTags, qtyAvailable } = req.body;
  if (title !== undefined) meal.title = title;
  if (description !== undefined) meal.description = description;
  if (dietaryTags !== undefined) meal.dietaryTags = dietaryTags;
  if (qtyAvailable !== undefined) meal.qtyAvailable = qtyAvailable;

  await meal.save();
  res.json(meal);
}