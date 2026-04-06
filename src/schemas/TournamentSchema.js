import mongoose, { Schema } from 'mongoose';
import { TOURNAMENT_STATUS } from '../helpers/constants';

const prizeTierSchema = new Schema(
  {
    rank_key: { type: String, required: true },
    title: { type: String, default: '' },
    prize_amount: { type: Number, default: 0 },
    prize_currency: { type: String, default: 'USD' },
    description: { type: String, default: '' },
  },
  { _id: false },
);

const arenaSchema = new Schema(
  {
    name: { type: String, default: '' },
    region_code: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { _id: false },
);

const tournamentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: {
      type: String, required: true, unique: true, index: true,
    },
    description: { type: String, default: '' },

    status: {
      type: String,
      enum: Object.values(TOURNAMENT_STATUS),
      default: TOURNAMENT_STATUS.draft,
      index: true,
    },

    scheduled_start_at: { type: Date, required: true, index: true },
    scheduled_end_at: { type: Date, default: null },

    registration_opens_at: { type: Date, required: true },
    registration_closes_at: { type: Date, required: true },

    price_amount_cents: { type: Number, required: true, min: 0 },
    price_currency: { type: String, default: 'usd' },

    max_participants: { type: Number, required: true, min: 1 },
    min_participants: { type: Number, default: 1 },

    arena: { type: arenaSchema, default: () => ({}) },
    /** Режим, карта, перспектива, код комнаты и т.д. */
    pubg_details: { type: Schema.Types.Mixed, default: {} },

    prizes: { type: [prizeTierSchema], default: [] },

    cover_image_url: { type: String, default: '' },

    /** Публичная статистика по играм доступна после публикации админом */
    stats_published: { type: Boolean, default: false },

    participants_confirmed_count: { type: Number, default: 0 },

    created_by_admin: { type: Schema.Types.ObjectId, ref: 'Admin', default: null },

    /** Идентификаторы внешних API (PUBG и др.) */
    external: { type: Schema.Types.Mixed, default: {} },

    is_deleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

tournamentSchema.index({ status: 1, scheduled_start_at: 1 });
tournamentSchema.index({ is_deleted: 1, status: 1, scheduled_start_at: 1 });

export default mongoose.model('Tournament', tournamentSchema);
