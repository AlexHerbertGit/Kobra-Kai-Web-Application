import mongoose from 'mongoose';
import { validationResult } from 'express-validator';
import Meal from '../models/Meal.js';
import Order from '../models/Order.js';
import User from '../models/User.js';

// placeOrder Function - Used by Beneficiary Users to place an order using the frontend interface.
export async function placeOrder(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  // beneficiary places an order for a meal (costTokens = 1)
  const { mealId } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const meal = await Meal.findById(mealId).session(session);
    if (!meal) throw Object.assign(new Error('Meal not found'), { statusCode: 404 });
    if (meal.qtyAvailable <= 0) throw Object.assign(new Error('Meal out of stock'), { statusCode: 400 });

    const beneficiary = await User.findById(req.user.id).session(session);
    if (!beneficiary) throw Object.assign(new Error('User not found'), { statusCode: 404 });
    if (beneficiary.role !== 'beneficiary') throw Object.assign(new Error('Only beneficiaries can place orders'), { statusCode: 403 });
    if (beneficiary.tokenBalance <= 0) throw Object.assign(new Error('Insufficient tokens'), { statusCode: 400 });

    // decrement stock and tokens atomically
    meal.qtyAvailable -= 1;
    beneficiary.tokenBalance -= 1;
    await meal.save({ session });
    await beneficiary.save({ session });

    const order = await Order.create([{
      mealId: meal._id,
      beneficiaryId: beneficiary._id,
      memberId: meal.memberId,
      status: 'pending',
      costTokens: 1
    }], { session });

    await session.commitTransaction();
    res.status(201).json(order[0]);
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

// acceptOrder Function - Used by Member users to accept pending meal requests.
export async function acceptOrder(req, res) {
  const { id } = req.params;
  const order = await Order.findById(id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.memberId.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

  order.status = 'accepted';
  await order.save();
  res.json(order);
}

// listOrders Function - Pulls all orders associated with the Members user ID and creates a json object. Used to display orders on frontend interface.
export async function listOrders(req, res) {
  const filter = {};
  if (req.user.role === 'beneficiary') filter.beneficiaryId = req.user.id;
  if (req.user.role === 'member') filter.memberId = req.user.id;

  const orders = await Order.find(filter)
    .populate('mealId')
    .sort({ createdAt: -1 })
    .lean();

  res.json(orders);
}