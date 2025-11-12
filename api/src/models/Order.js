import mongoose from 'mongoose';

// Order Schema with Mongoose
const orderSchema = new mongoose.Schema({
  mealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Meal', required: true, index: true },
  beneficiaryId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  status: {
    type: String,
    enum: ['pending', 'current', 'completed', 'cancelled', 'inProgress', 'accepted'],
    default: 'pending'
  },
  quantity: { type: Number, default: 1, min: 1 },
  costTokens: { type: Number, default: 1, min: 0 }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);