import UserSchema from '../schemas/UserSchema';
import throwError from '../helpers/throwError';
import { comparePassword } from '../helpers/getPasswordHash';
import getConfirmationCode from '../helpers/getConfirmationCode';
import MailServices from './MailServices';

class UsersServices {
  static findByEmail = (email, withPassword = false) => {
    const q = UserSchema.findOne({ email: email.toLowerCase().trim() });
    if (withPassword) {
      return q.select('+password');
    }
    return q;
  };

  /**
   * Шаг 1 (как Nomad register): создаёт/обновляет пользователя, шлёт код на почту.
   */
  static registerStart = async ({
    email, name, pubg_id, password, telegram_username,
  }) => {
    const emailNorm = email.toLowerCase().trim();
    const existing = await UserSchema.findOne({ email: emailNorm });

    if (existing && existing.is_email_confirmed) {
      throwError(400, 'Пользователь с таким email уже зарегистрирован');
    }

    const { code, validUntil } = getConfirmationCode();
    await MailServices.sendConfirmationCode(code, emailNorm);

    if (existing) {
      existing.name = name;
      existing.pubg_id = pubg_id;
      existing.password = password;
      existing.telegram_username = telegram_username || '';
      existing.confirmation_code = code;
      existing.code_valid_until = validUntil;
      existing.is_email_confirmed = false;
      await existing.save();
      return existing;
    }

    const user = new UserSchema({
      email: emailNorm,
      name,
      pubg_id,
      password,
      telegram_username: telegram_username || '',
      confirmation_code: code,
      code_valid_until: validUntil,
      is_email_confirmed: false,
    });
    await user.save();
    return user;
  };

  /**
   * Шаг 2: проверка кода и подтверждение email (исправлен порядок проверок относительно Nomad).
   */
  static registerConfirm = async (email, code) => {
    const emailNorm = email.toLowerCase().trim();
    const user = await UserSchema.findOne({ email: emailNorm });

    if (!user) {
      throwError(400, 'Пользователь не найден');
    }
    if (!user.confirmation_code) {
      throwError(400, 'Для этого аккаунта нет кода подтверждения');
    }
    if (user.is_email_confirmed) {
      throwError(400, 'Email уже подтверждён');
    }
    if (Date.now() > new Date(user.code_valid_until).getTime()) {
      throwError(401, 'Срок действия кода истёк');
    }
    if (String(user.confirmation_code) !== String(code)) {
      throwError(401, 'Неверный код');
    }

    user.confirmation_code = null;
    user.code_valid_until = null;
    user.is_email_confirmed = true;
    await user.save();

    return user;
  };

  static login = async (email, password) => {
    const user = await UsersServices.findByEmail(email, true);
    if (!user || !user.is_active) {
      throwError(400, 'Неверный email или пароль');
    }
    if (!user.is_email_confirmed) {
      throwError(403, 'Подтвердите email по коду из письма');
    }
    const ok = await comparePassword(password, user.password);
    if (!ok) {
      throwError(400, 'Неверный email или пароль');
    }
    return user;
  };

  static updateProfile = async (userId, data) => {
    const allowed = ['name', 'pubg_id', 'telegram_username'];
    const patch = {};
    allowed.forEach((k) => {
      if (data[k] !== undefined) patch[k] = data[k];
    });
    const user = await UserSchema.findByIdAndUpdate(userId, patch, { new: true });
    if (!user) {
      throwError(404, 'User not found');
    }
    return user;
  };
}

export default UsersServices;
