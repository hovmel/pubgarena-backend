import UsersServices from '../services/UsersServices';
import AdminsServices from '../services/AdminsServices';
import AuthorizationServices from '../services/AuthorizationServices';
import validate from '../helpers/validation';

class AuthController {
  /** Шаг 1: отправка кода на почту (логика как Nomad register). */
  static register = async (req, res, next) => {
    try {
      validate(req.body, {
        email: 'required|email',
        name: 'required|string|min:2',
        pubg_id: 'required|string|min:2',
        password: 'required|string|min:6',
        telegram_username: 'required|string|min:1',
      });
      await UsersServices.registerStart(req.body);
      res.json({ status: 'ok' });
    } catch (e) {
      next(e);
    }
  };

  /** Шаг 2: ввод кода → JWT. */
  static registerConfirm = async (req, res, next) => {
    try {
      validate(req.body, {
        email: 'required|email',
        code: 'required|string',
      });
      const user = await UsersServices.registerConfirm(req.body.email, req.body.code);
      const token = AuthorizationServices.signJwt(
        AuthorizationServices.tokenPayloadForUser(user._id),
      );
      res.json({
        status: 'ok',
        token,
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

  static loginUser = async (req, res, next) => {
    try {
      validate(req.body, {
        email: 'required|email',
        password: 'required|string',
      });
      const user = await UsersServices.login(req.body.email, req.body.password);
      const token = AuthorizationServices.signJwt(
        AuthorizationServices.tokenPayloadForUser(user._id),
      );
      res.json({
        status: 'ok',
        token,
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

  static loginAdmin = async (req, res, next) => {
    try {
      validate(req.body, {
        email: 'required|email',
        password: 'required|string',
      });
      const admin = await AdminsServices.login(req.body.email, req.body.password);
      const token = AuthorizationServices.signJwt(
        AuthorizationServices.tokenPayloadForAdmin(admin._id),
      );
      res.json({
        status: 'ok',
        token,
        admin: {
          id: admin._id,
          email: admin.email,
          display_name: admin.display_name,
          access_codes: admin.access_codes,
          permissions_json: admin.permissions_json,
        },
      });
    } catch (e) {
      next(e);
    }
  };
}

export default AuthController;
