import mongoose, { Schema } from 'mongoose';

const tournamentGameSchema = new mongoose.Schema(
  {
    tournament: {
      type: Schema.Types.ObjectId, ref: 'Tournament', required: true, index: true,
    },
    game_index: { type: Number, required: true },
    label: { type: String, default: '' },
    played_at: { type: Date, default: null },
    pubg_room_id: { type: String, default: '' },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

tournamentGameSchema.index({ tournament: 1, game_index: 1 }, { unique: true });

export default mongoose.model('TournamentGame', tournamentGameSchema);
