import { validationResult } from 'express-validator';
import User from '../models/User.js';

export const SERIALIZE_FIELDS = ['_id', 'name', 'address', 'email', 'role', 'tokenBalance'];

export function serializeUser(user) {
  if (!user) return null;
  const output = {};
  for (const key of SERIALIZE_FIELDS) {
    if (key === '_id') {
      output.id = user._id?.toString();
    } else if (typeof user[key] !== 'undefined') {
      output[key] = user[key];
    }
  }
  return output;
}

const DENIED_FIELDS = new Set(['_id', 'id', 'email', 'passwordHash', 'role', 'tokenBalance', 'createdAt', 'updatedAt', '__v']);
const EDITABLE_FIELDS = Object.keys(User.schema.paths).filter((field) => !DENIED_FIELDS.has(field));

export async function getCurrentUser(req, res) {
  const user = await User.findById(req.user.id).lean();
  res.json(serializeUser(user));
}

export async function updateCurrentUser(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const updates = {};
  for (const field of EDITABLE_FIELDS) {
    if (typeof req.body?.[field] !== 'undefined') {
      updates[field] = req.body[field];
    }
  }

  if (!Object.keys(updates).length) {
    return res.status(400).json({ message: 'No valid fields provided for update' });
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $set: updates },
    { new: true, runValidators: true }
  );

  res.json(serializeUser(user));
}