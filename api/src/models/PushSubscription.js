import mongoose from 'mongoose';

const pushSubscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  endpoint: { type: String, required: true, trim: true },
  keys: {
    p256dh: { type: String, required: true },
    auth: { type: String, required: true }
  },
  device: { type: String, default: null, trim: true },
  userAgent: { type: String, default: null },
  expiresAt: { type: Date, default: null }
}, { timestamps: true });

pushSubscriptionSchema.index({ user: 1, endpoint: 1 }, { unique: true });
pushSubscriptionSchema.index({ endpoint: 1 });

export default mongoose.model('PushSubscription', pushSubscriptionSchema);