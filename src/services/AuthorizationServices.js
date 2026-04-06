import jwt from 'jsonwebtoken';
import throwError from '../helpers/throwError';
import { ADMIN_ACCESS, ENV, USER_TYPES } from '../helpers/constants';
import AdminSchema from '../schemas/AdminSchema';

class AuthorizationServices {
  static signJwt = (payload, numberOfDays = ENV.JWT_EXPIRES_DAYS, key = ENV.JWT_KEY) => jwt.sign(payload, key, { expiresIn: `${numberOfDays}d` });

  static verifyJwt = ({ token, key = ENV.JWT_KEY, shouldThrowError = true }) => {
    if (!token) {
      if (shouldThrowError) {
        throwError(401, 'No token');
      }
      return null;
    }
    const raw = token.replace('Bearer ', '');
    return jwt.verify(raw, key);
  };

  static checkIfAdmin = async (adminId, requiredAccessCode) => {
    const admin = await AdminSchema.findById(adminId);

    if (!admin || !admin.is_active) {
      throwError(403, 'Admin not found or inactive');
    }

    if (!requiredAccessCode) {
      return true;
    }

    const codes = admin.access_codes || [];
    if (codes.includes('*')) {
      return true;
    }

    if (!codes.includes(requiredAccessCode)) {
      const entry = Object.values(ADMIN_ACCESS).find((a) => a.code === requiredAccessCode);
      const msg = entry?.label ? `Нет доступа: ${entry.label}` : 'Нет доступа';
      throwError(403, msg);
    }

    return true;
  };

  static tokenPayloadForUser = (userId) => ({ id: userId.toString(), type: USER_TYPES.user });

  static tokenPayloadForAdmin = (adminId) => ({ id: adminId.toString(), type: USER_TYPES.admin });
}

export default AuthorizationServices;
