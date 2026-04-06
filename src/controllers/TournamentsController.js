import TournamentSchema from '../schemas/TournamentSchema';
import { TOURNAMENT_STATUS } from '../helpers/constants';
import TournamentsServices from '../services/TournamentsServices';
import TournamentRegistrationsServices from '../services/TournamentRegistrationsServices';
import TournamentStatsServices from '../services/TournamentStatsServices';
import throwError from '../helpers/throwError';

class TournamentsController {
  static list = async (req, res, next) => {
    try {
      const {
        scope,
        status,
        q,
        arena_name,
        from_date,
        to_date,
        page,
        per_page,
        sort,
      } = req.query;
      const result = await TournamentsServices.listPublic({
        scope: scope || 'all',
        status,
        q,
        arena_name,
        from_date,
        to_date,
        page: Number(page) || 1,
        per_page: Number(per_page) || 20,
        sort: sort || 'start_asc',
      });
      res.json({ status: 'ok', ...result });
    } catch (e) {
      next(e);
    }
  };

  static getOne = async (req, res, next) => {
    try {
      const t = await TournamentsServices.getByIdPublic(req.params.id);
      const confirmedCount = await TournamentsServices.countConfirmed(t._id);
      res.json({
        status: 'ok',
        tournament: t,
        registration: {
          slots_taken: confirmedCount,
          slots_total: t.max_participants,
        },
      });
    } catch (e) {
      next(e);
    }
  };

  static mine = async (req, res, next) => {
    try {
      const { page, per_page, scope } = req.query;
      const result = await TournamentsServices.listMine(req.userId, {
        page: Number(page) || 1,
        per_page: Number(per_page) || 20,
        scope: scope || 'all',
      });
      res.json({ status: 'ok', ...result });
    } catch (e) {
      next(e);
    }
  };

  static registerCheckout = async (req, res, next) => {
    try {
      const checkout = await TournamentRegistrationsServices.startCheckout({
        tournamentId: req.params.id,
        userId: req.userId,
      });
      res.json({ status: 'ok', ...checkout });
    } catch (e) {
      next(e);
    }
  };

  static games = async (req, res, next) => {
    try {
      const t = await TournamentSchema.findOne({
        _id: req.params.id,
        is_deleted: false,
        status: { $ne: TOURNAMENT_STATUS.draft },
      }).lean();
      if (!t) {
        throwError(404, 'Tournament not found');
      }
      if (!t.stats_published) {
        throwError(403, 'Statistics are not published yet');
      }
      const data = await TournamentStatsServices.getPublishedGamesForTournament(t._id);
      res.json({ status: 'ok', tournament_id: t._id, ...data });
    } catch (e) {
      next(e);
    }
  };
}

export default TournamentsController;
