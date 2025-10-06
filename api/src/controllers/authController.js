import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { signJwt, setAuthCookie } from '../utils/jwt.js';

// Register Function - Creates user account, adds their role, and sets initial token balance (if Beneficiary)
export async function register(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, password, role } = req.body;

  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: 'Email already registered' });

  const passwordHash = await bcrypt.hash(password, 10);
  // Beneficiaries get default tokenBalance (5). Members get 0 (they don't spend tokens).
  const initial = role === 'member' ? 0 : undefined;

  const user = await User.create({
    name, email, passwordHash, role: role ?? 'beneficiary',
    ...(initial !== undefined ? { tokenBalance: initial } : {})
  });

  const token = signJwt(user._id.toString());
  setAuthCookie(res, token);

  res.status(201).json({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    tokenBalance: user.tokenBalance
  });
}

// Login Function - Validates user credentials against DB, signs JWT and sets Cookie when validated, throws error if invalid.
export async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

  const token = signJwt(user._id.toString());
  setAuthCookie(res, token);

  res.json({ id: user._id, name: user.name, email: user.email, role: user.role, tokenBalance: user.tokenBalance });
}

// Me Function - Used to check the users account details.
export async function me(req, res) {
  const user = await User.findById(req.user.id).lean();
  res.json({ id: user._id, name: user.name, email: user.email, role: user.role, tokenBalance: user.tokenBalance });
}

// Logout Function - Logs out the user, clears auth cookie and JWT.
export async function logout(_req, res) {
  res.clearCookie('jwt', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
  res.json({ ok: true });
}