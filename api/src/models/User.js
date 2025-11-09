import mongoose from 'mongoose';

// User Schema with Mongoose
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  address: {type: String, required: true, trim: true, maxLength: 250},
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['beneficiary', 'member', 'admin'], default: 'beneficiary' },
  tokenBalance: { type: Number, default: 5, min: 0 } // beneficiaries start with 5 by default
}, { timestamps: true });

export default mongoose.model('User', userSchema);