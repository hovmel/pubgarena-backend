import AdminSchema from '../schemas/AdminSchema';
import { ALL_ADMIN_ACCESS_CODES, ENV } from './constants';

export default async function initSeedData() {
  if (!ENV.SEED_ADMINS_ON_START) {
    return;
  }

  const existing = await AdminSchema.countDocuments();
  if (existing > 0) {
    return;
  }

  const email1 = ENV.SEED_ADMIN_1_EMAIL || 'admin1@pubgarena.local';
  const email2 = ENV.SEED_ADMIN_2_EMAIL || 'admin2@pubgarena.local';
  const pass1 = ENV.SEED_ADMIN_1_PASSWORD || 'ChangeMeAdmin1!';
  const pass2 = ENV.SEED_ADMIN_2_PASSWORD || 'ChangeMeAdmin2!';
  const name1 = ENV.SEED_ADMIN_1_NAME || 'Admin One';
  const name2 = ENV.SEED_ADMIN_2_NAME || 'Admin Two';

  await AdminSchema.create([
    {
      email: email1,
      display_name: name1,
      password: pass1,
      access_codes: ALL_ADMIN_ACCESS_CODES,
      permissions_json: { version: 1, full_access: true },
    },
    {
      email: email2,
      display_name: name2,
      password: pass2,
      access_codes: ALL_ADMIN_ACCESS_CODES,
      permissions_json: { version: 1, full_access: true },
    },
  ]);

  console.log('Seeded 2 admins with full access_codes. Change passwords in production.');
}
