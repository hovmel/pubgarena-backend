import mongoose, { Schema } from 'mongoose';

const tournamentPlayerGameStatSchema = new mongoose.Schema(
  {
    tournament: {
      type: Schema.Types.ObjectId, ref: 'Tournament', required: true, index: true,
    },
    game: {
      type: Schema.Types.ObjectId, ref: 'TournamentGame', required: true, index: true,
    },
    user: {
      type: Schema.Types.ObjectId, ref: 'User', required: true, index: true,
    },

    placement: { type: Number, default: null },
    kills: { type: Number, default: null },
    assists: { type: Number, default: null },
    damage_dealt: { type: Number, default: null },
    survival_time_sec: { type: Number, default: null },

    /** Полный снимок статистики (любые поля отчёта админа / будущего PUBG API) */
    stats_snapshot: { type: Schema.Types.Mixed, default: {} },

    uploaded_by_admin: { type: Schema.Types.ObjectId, ref: 'Admin', default: null },
  },
  { timestamps: true },
);

tournamentPlayerGameStatSchema.index({ game: 1, user: 1 }, { unique: true });

export default mongoose.model('TournamentPlayerGameStat', tournamentPlayerGameStatSchema);
