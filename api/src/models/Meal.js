import mongoose from 'mongoose';

// Meal Schema with Mongoose
const mealSchema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, trim: true, maxlength: 1000 },
  dietaryTags: [{ type: String, trim: true }],
  qtyAvailable: { type: Number, required: true, min: 0 },
}, { timestamps: true });

export default mongoose.model('Meal', mealSchema);