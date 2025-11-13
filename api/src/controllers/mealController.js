import { validationResult } from 'express-validator';
import Meal from '../models/Meal.js';

// listMeals Function - Pulls the meals stored in the database, creates a json object that is returned.
export async function listMeals(_req, res) {
  const meals = await Meal.find()
    .sort({ createdAt: -1 })
    .populate('memberId', 'name address')
    .lean();

  const enrichedMeals = meals.map(meal => {
    const member = meal.memberId && typeof meal.memberId === 'object'
      ? {
          id: meal.memberId._id?.toString() ?? '',
          name: meal.memberId.name ?? 'Community Member',
          address: meal.memberId.address ?? ''
        }
      : null;

    const memberId = member?.id || (typeof meal.memberId === 'string' ? meal.memberId : meal.memberId?.toString?.());

    return {
      ...meal,
      member,
      memberId,
      tokenValue: typeof meal.tokenValue === 'number' ? meal.tokenValue : 1
    };
  });

  res.json(enrichedMeals);
}

// creatMeal Function - Used by Member users to create meals using the frontend interface.
export async function createMeal(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { title, description, dietaryTags, qtyAvailable, tokenValue } = req.body;
  const normalizedTokenValue = Number.isFinite(tokenValue) ? tokenValue : Number(tokenValue);
  const meal = await Meal.create({
    memberId: req.user.id,
    title,
    description,
    dietaryTags: dietaryTags ?? [],
    qtyAvailable,
    tokenValue: Number.isFinite(normalizedTokenValue) ? normalizedTokenValue : 1
  });
  res.status(201).json(meal);
}

// updateMeal Function - Used by Member users to update meal details, saves updated changes in the DB. 
export async function updateMeal(req, res) {

  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { id } = req.params;
  const meal = await Meal.findById(id);
  if (!meal) return res.status(404).json({ message: 'Meal not found' });
  if (meal.memberId.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

  const { title, description, dietaryTags, qtyAvailable, tokenValue } = req.body;
  if (title !== undefined) meal.title = title;
  if (description !== undefined) meal.description = description;
  if (dietaryTags !== undefined) meal.dietaryTags = dietaryTags;
  if (qtyAvailable !== undefined) meal.qtyAvailable = qtyAvailable;
  if (tokenValue !== undefined) {
    const normalizedTokenValue = Number.isFinite(tokenValue) ? tokenValue : Number(tokenValue);
    meal.tokenValue = Number.isFinite(normalizedTokenValue) ? normalizedTokenValue : 1;
  }

  await meal.save();
  res.json(meal);
}

// deleteMeal Function - Removes a meal if owned by the authenticated member.
export async function deleteMeal(req, res) {
  const { id } = req.params;
  const meal = await Meal.findById(id);
  if (!meal) return res.status(404).json({ message: 'Meal not found' });
  if (meal.memberId.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

  await meal.deleteOne();
  res.status(204).send();
}