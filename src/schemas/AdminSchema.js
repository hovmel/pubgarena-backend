import mongoose from 'mongoose';
import { hashPassword } from '../helpers/getPasswordHash';

const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String, required: true, unique: true, lowercase: true, trim: true,
    },
    display_name: { type: String, required: true, trim: true },
    password: { type: String, required: true, select: false },
    access_codes: [{ type: String }],
    /** Расширяемые флаги / настройки доступа (JSON) */
    permissions_json: { type: mongoose.Schema.Types.Mixed, default: {} },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

adminSchema.pre('save', async function preSaveAdmin() {
  if (!this.isModified('password')) {
    return;
  }
  this.password = await hashPassword(this.password);
});

export default mongoose.model('Admin', adminSchema);
