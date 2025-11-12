import mongoose from 'mongoose';
import { validationResult } from 'express-validator';
import Meal from '../models/Meal.js';
import Order from '../models/Order.js';
import User from '../models/User.js';

// placeOrder Function - Used by Beneficiary Users to place an order using the frontend interface.
export async function placeOrder(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  // beneficiary places an order for a meal 
  const { mealId, quantity } = req.body;
  const qty = Number(quantity ?? 1);
  if (!Number.isInteger(qty) || qty <= 0) {
    return res.status(400).json({ message: 'Quantity must be a positive integer' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const meal = await Meal.findById(mealId).session(session);
    if (!meal) throw Object.assign(new Error('Meal not found'), { statusCode: 404 });
    if (meal.qtyAvailable < qty) throw Object.assign(new Error('Meal out of stock'), { statusCode: 400 });

    const beneficiary = await User.findById(req.user.id).session(session);
    if (!beneficiary) throw Object.assign(new Error('User not found'), { statusCode: 404 });
    if (beneficiary.role !== 'beneficiary') throw Object.assign(new Error('Only beneficiaries can place orders'), { statusCode: 403 });
    const tokenValue = Number.isFinite(meal.tokenValue) ? Number(meal.tokenValue) : 1;
    const totalCost = tokenValue * qty;
    if (beneficiary.tokenBalance < totalCost) throw Object.assign(new Error('Insufficient tokens'), { statusCode: 400 });

    const member = await User.findById(meal.memberId).session(session);
    if (!member) throw Object.assign(new Error('Meal provider not found'), { statusCode: 404 });

    // decrement stock and tokens atomically
    meal.qtyAvailable -= qty;
    beneficiary.tokenBalance -= totalCost;
    member.tokenBalance = (member.tokenBalance ?? 0) + totalCost;
    await meal.save({ session });
    await beneficiary.save({ session });
    await member.save({ session });

    const order = await Order.create([{
      mealId: meal._id,
      beneficiaryId: beneficiary._id,
      memberId: meal.memberId,
      status: 'pending',
      quantity: qty,
      costTokens: totalCost
    }], { session });

    await session.commitTransaction();
    const createdOrder = order[0]?.toObject ? order[0].toObject() : order[0];
    res.status(201).json({
      order: createdOrder,
      beneficiaryBalance: beneficiary.tokenBalance,
      memberBalance: member.tokenBalance
    });
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

// moveOrderToCurrent Function - Used by Member users to accept pending meal requests and mark them as current.
export async function moveOrderToCurrent(req, res) {
  const { id } = req.params;
  const order = await Order.findById(id);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  const isMember = order.memberId.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin';
  if (!isMember && !isAdmin) return res.status(403).json({ message: 'Forbidden' });

  if (order.status !== 'pending') {
    return res.status(400).json({ message: 'Only pending orders can be moved to current' });
  }

  order.status = 'current';
  await order.save();
  res.json(order);
}

// completeOrder Function - Allows members or beneficiaries to mark a current order as completed.
export async function completeOrder(req, res) {
  const { id } = req.params;
  const order = await Order.findById(id);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  const isMember = order.memberId.toString() === req.user.id;
  const isBeneficiary = order.beneficiaryId.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin';
  if (!isMember && !isBeneficiary && !isAdmin) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  if (!['current', 'inProgress', 'accepted'].includes(order.status)) {
    return res.status(400).json({ message: 'Only current orders can be marked as completed' });
  }

  order.status = 'completed';

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