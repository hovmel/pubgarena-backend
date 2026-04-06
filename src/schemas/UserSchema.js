import mongoose from 'mongoose';
import { hashPassword } from '../helpers/getPasswordHash';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String, required: true, unique: true, lowercase: true, trim: true,
    },
    name: { type: String, required: true, trim: true },
    pubg_id: {
      type: String, required: true, trim: true, index: true,
    },
    password: { type: String, required: true, select: false },
    telegram_username: { type: String, trim: true, default: '' },
    /** Зарезервировано под проверку доступа к Telegram-боту */
    telegram_user_id: { type: String, default: '' },
    telegram_bot_access_granted: { type: Boolean, default: false },
    is_email_confirmed: { type: Boolean, default: false },
    confirmation_code: { type: String, default: null },
    code_valid_until: { type: Date, default: null },
    is_active: { type: Boolean, default: true },
    /** Кэш ответа PUBG API (будущая интеграция) */
    pubg_profile_cache: { type: mongoose.Schema.Types.Mixed, default: null },
    pubg_profile_cached_at: { type: Date, default: null },
  },
  { timestamps: true },
);

userSchema.pre('save', async function preSaveUser() {
  if (!this.isModified('password')) {
    return;
  }
  this.password = await hashPassword(this.password);
});

export default mongoose.model('User', userSchema);
