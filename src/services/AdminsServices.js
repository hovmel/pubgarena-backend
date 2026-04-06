import AdminSchema from '../schemas/AdminSchema';
import throwError from '../helpers/throwError';
import { comparePassword } from '../helpers/getPasswordHash';

class AdminsServices {
  static findByEmail = (email, withPassword = false) => {
    const q = AdminSchema.findOne({ email: email.toLowerCase().trim() });
    if (withPassword) {
      return q.select('+password');
    }
    return q;
  };

  static login = async (email, password) => {
    const admin = await AdminsServices.findByEmail(email, true);
    if (!admin || !admin.is_active) {
      throwError(400, 'Invalid email or password');
    }
    const ok = await comparePassword(password, admin.password);
    if (!ok) {
      throwError(400, 'Invalid email or password');
    }
    return admin;
  };
}

export default AdminsServices;
