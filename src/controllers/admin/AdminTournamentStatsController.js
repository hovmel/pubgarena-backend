import TournamentStatsServices from '../../services/TournamentStatsServices';
import TournamentsServices from '../../services/TournamentsServices';
import throwError from '../../helpers/throwError';

class AdminTournamentStatsController {
  static get = async (req, res, next) => {
    try {
      await TournamentsServices.getByIdAdmin(req.params.id);
      const data = await TournamentStatsServices.getPublishedGamesForTournament(req.params.id);
      res.json({ status: 'ok', tournament_id: req.params.id, ...data });
    } catch (e) {
      next(e);
    }
  };

  static replace = async (req, res, next) => {
    try {
      const { games } = req.body;
      if (!Array.isArray(games)) {
        throwError(400, 'Body must contain games array');
      }
      await TournamentsServices.getByIdAdmin(req.params.id);
      const data = await TournamentStatsServices.replaceTournamentStats(
        req.params.id,
        games,
        req.adminId,
      );
      res.json({ status: 'ok', ...data });
    } catch (e) {
      next(e);
    }
  };
}

export default AdminTournamentStatsController;
