import mongoose from 'mongoose';
import TournamentGameSchema from '../schemas/TournamentGameSchema';
import TournamentPlayerGameStatSchema from '../schemas/TournamentPlayerGameStatSchema';
import TournamentRegistrationSchema from '../schemas/TournamentRegistrationSchema';
import throwError from '../helpers/throwError';
import { REGISTRATION_STATUS } from '../helpers/constants';

class TournamentStatsServices {
  static getPublishedGamesForTournament = async (tournamentId) => {
    const games = await TournamentGameSchema.find({ tournament: tournamentId })
      .sort({ game_index: 1 })
      .lean();

    const stats = await TournamentPlayerGameStatSchema.find({ tournament: tournamentId })
      .populate('user', 'name pubg_id email')
      .lean();

    const byGame = {};
    games.forEach((g) => {
      byGame[g._id.toString()] = { ...g, results: [] };
    });
    stats.forEach((s) => {
      const key = s.game.toString();
      if (byGame[key]) {
        byGame[key].results.push(s);
      }
    });

    return { games: Object.values(byGame) };
  };

  static getUserHistory = async (userId) => {
    const stats = await TournamentPlayerGameStatSchema.find({ user: userId })
      .populate('tournament', 'title slug scheduled_start_at status stats_published')
      .populate('game', 'game_index label played_at')
      .sort({ createdAt: -1 })
      .lean();

    return stats.filter((s) => s.tournament && s.tournament.stats_published);
  };

  static replaceTournamentStats = async (tournamentId, gamesPayload, adminId) => {
    if (!Array.isArray(gamesPayload) || !gamesPayload.length) {
      throwError(400, 'games must be a non-empty array');
    }

    const confirmedUsers = await TournamentRegistrationSchema.find({
      tournament: tournamentId,
      status: REGISTRATION_STATUS.confirmed,
    }).distinct('user');
    const allowed = new Set(confirmedUsers.map((id) => id.toString()));

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      await TournamentGameSchema
        .deleteMany({ tournament: tournamentId })
        .session(session);
      await TournamentPlayerGameStatSchema
        .deleteMany({ tournament: tournamentId })
        .session(session);

      for (const g of gamesPayload) {
        const game = new TournamentGameSchema({
          tournament: tournamentId,
          game_index: g.game_index,
          label: g.label || `Игра ${g.game_index}`,
          played_at: g.played_at || null,
          pubg_room_id: g.pubg_room_id || '',
          metadata: g.metadata || {},
        });
        // eslint-disable-next-line no-await-in-loop
        await game.save({ session });

        const results = g.results || [];
        for (const row of results) {
          const uid = row.user_id;
          if (!uid || !mongoose.Types.ObjectId.isValid(uid)) {
            throwError(400, 'Each result needs valid user_id');
          }
          if (!allowed.has(String(uid))) {
            throwError(400, `User ${uid} is not a confirmed participant`);
          }
          const stat = new TournamentPlayerGameStatSchema({
            tournament: tournamentId,
            game: game._id,
            user: uid,
            placement: row.placement ?? null,
            kills: row.kills ?? null,
            assists: row.assists ?? null,
            damage_dealt: row.damage_dealt ?? null,
            survival_time_sec: row.survival_time_sec ?? null,
            stats_snapshot: row.stats || {},
            uploaded_by_admin: adminId,
          });
          // eslint-disable-next-line no-await-in-loop
          await stat.save({ session });
        }
      }

      await session.commitTransaction();
    } catch (e) {
      await session.abortTransaction();
      throw e;
    } finally {
      session.endSession();
    }

    return TournamentStatsServices.getPublishedGamesForTournament(tournamentId);
  };
}

export default TournamentStatsServices;
