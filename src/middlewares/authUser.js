import { USER_TYPES } from '../helpers/constants';
import AuthorizationServices from '../services/AuthorizationServices';
import throwError from '../helpers/throwError';

export default function authUser() {
  return (req, res, next) => {
    try {
      const payload = AuthorizationServices.verifyJwt({
        token: req.headers.authorization,
      });
      if (payload.type !== USER_TYPES.user) {
        throwError(403, 'User token required');
      }
      req.userId = payload.id;
      req.auth = payload;
      next();
    } catch (e) {
      const status = e.status || 401;
      res.status(status).send({
        status: 'error',
        message: e.message,
      });
    }
  };
}
