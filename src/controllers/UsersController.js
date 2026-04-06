import UserSchema from '../schemas/UserSchema';
import UsersServices from '../services/UsersServices';
import TournamentStatsServices from '../services/TournamentStatsServices';
import validate from '../helpers/validation';
import throwError from '../helpers/throwError';

class UsersController {
  static me = async (req, res, next) => {
    try {
      const user = await UserSchema.findById(req.userId);
      if (!user) {
        throwError(404, 'User not found');
      }
      res.json({
        status: 'ok',
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          pubg_id: user.pubg_id,
          telegram_username: user.telegram_username,
          telegram_bot_access_granted: user.telegram_bot_access_granted,
          is_email_confirmed: user.is_email_confirmed,
        },
      });
    } catch (e) {
      next(e);
    }
  };

  static updateMe = async (req, res, next) => {
    try {
      validate(req.body, {
        name: 'string|min:2',
        pubg_id: 'string|min:2',
        telegram_username: 'string',
      });
      const user = await UsersServices.updateProfile(req.userId, req.body);
      res.json({
        status: 'ok',
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          pubg_id: user.pubg_id,
          telegram_username: user.telegram_username,
        },
      });
    } catch (e) {
      next(e);
    }
  };

  static myTournamentStatsHistory = async (req, res, next) => {
    try {
      const rows = await TournamentStatsServices.getUserHistory(req.userId);
      res.json({ status: 'ok', history: rows });
    } catch (e) {
      next(e);
    }
  };

  /** Заготовка под проверку доступа к Telegram-боту */
  static telegramAccess = async (req, res, next) => {
    try {
      const user = await UserSchema.findById(req.userId);
      if (!user) {
        throwError(404, 'User not found');
      }
      res.json({
        status: 'ok',
        telegram_username: user.telegram_username,
        telegram_user_id: user.telegram_user_id,
        bot_access_granted: user.telegram_bot_access_granted,
      });
    } catch (e) {
      next(e);
    }
  };
}

export default UsersController;
