import mongoose, { Schema } from 'mongoose';
import { PAYMENT_STATUS, PAYMENT_TYPE } from '../helpers/constants';

const paymentSchema = new mongoose.Schema(
  {
    provider: { type: String, default: 'stripe' },

    stripe_customer_id: { type: String, default: '' },
    stripe_checkout_session_id: {
      type: String, default: '', unique: true, sparse: true,
    },
    stripe_payment_intent_id: { type: String, default: '', index: true },
    stripe_charge_id: { type: String, default: '' },
    stripe_balance_transaction_id: { type: String, default: '' },

    amount_cents: { type: Number, required: true },
    amount_received_cents: { type: Number, default: 0 },
    currency: { type: String, default: 'usd' },
    fee_cents: { type: Number, default: 0 },

    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.pending,
      index: true,
    },

    type: {
      type: String,
      enum: Object.values(PAYMENT_TYPE),
      default: PAYMENT_TYPE.tournament_registration,
    },

    user: {
      type: Schema.Types.ObjectId, ref: 'User', default: null, index: true,
    },
    tournament: {
      type: Schema.Types.ObjectId, ref: 'Tournament', default: null, index: true,
    },
    registration: { type: Schema.Types.ObjectId, ref: 'TournamentRegistration', default: null },

    customer_email: { type: String, default: '' },
    receipt_url: { type: String, default: '' },
    failure_message: { type: String, default: '' },

    metadata: { type: Schema.Types.Mixed, default: {} },
    last_stripe_event_type: { type: String, default: '' },
  },
  { timestamps: true },
);

export default mongoose.model('Payment', paymentSchema);
