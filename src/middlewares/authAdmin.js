import { USER_TYPES } from '../helpers/constants';
import AuthorizationServices from '../services/AuthorizationServices';
import throwError from '../helpers/throwError';

/**
 * @param {string | { code: string } | null | undefined} requiredAccess
 * Код из ADMIN_ACCESS или объект { code } (как в Nomad-Back).
 */
export default function authAdmin(requiredAccess) {
  return async (req, res, next) => {
    try {
      const payload = AuthorizationServices.verifyJwt({
        token: req.headers.authorization,
      });
      if (payload.type !== USER_TYPES.admin) {
        throwError(403, 'Admin token required');
      }
      const accessCode = requiredAccess?.code || requiredAccess;
      await AuthorizationServices.checkIfAdmin(payload.id, accessCode);
      req.userId = payload.id;
      req.adminId = payload.id;
      req.auth = payload;
      next();
    } catch (e) {
      console.error(e);
      res.status(e.status || 403).send({
        status: 'error',
        message: e.message,
      });
    }
  };
}
