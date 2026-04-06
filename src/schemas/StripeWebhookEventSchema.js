import mongoose from 'mongoose';

const stripeWebhookEventSchema = new mongoose.Schema(
  {
    stripe_event_id: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    processed_at: { type: Date, default: () => new Date() },
  },
  { timestamps: true },
);

export default mongoose.model('StripeWebhookEvent', stripeWebhookEventSchema);
