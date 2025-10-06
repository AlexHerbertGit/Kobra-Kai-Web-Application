import mongoose from 'mongoose';

// Order Schema with Mongoose
const orderSchema = new mongoose.Schema({
  mealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Meal', required: true, index: true },
  beneficiaryId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  status: { type: String, enum: ['pending', 'accepted', 'cancelled'], default: 'pending' },
  costTokens: { type: Number, default: 1, min: 0 }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);