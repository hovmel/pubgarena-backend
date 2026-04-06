import mongoose, { Schema } from 'mongoose';
import { REGISTRATION_STATUS } from '../helpers/constants';

const tournamentRegistrationSchema = new mongoose.Schema(
  {
    tournament: {
      type: Schema.Types.ObjectId, ref: 'Tournament', required: true, index: true,
    },
    user: {
      type: Schema.Types.ObjectId, ref: 'User', required: true, index: true,
    },
    status: {
      type: String,
      enum: Object.values(REGISTRATION_STATUS),
      default: REGISTRATION_STATUS.pending_payment,
      index: true,
    },
    stripe_checkout_session_id: { type: String, default: '', index: true },
    stripe_payment_intent_id: { type: String, default: '' },
    amount_cents: { type: Number, default: 0 },
    currency: { type: String, default: 'usd' },
    notes: { type: String, default: '' },
  },
  { timestamps: true },
);

tournamentRegistrationSchema.index({ tournament: 1, user: 1 }, { unique: true });

export default mongoose.model('TournamentRegistration', tournamentRegistrationSchema);
