export const USER_TYPES = {
  user: 'user',
  admin: 'admin',
};

/**
 * Права админов: access_codes + при необходимости permissions_json.
 */
export const ADMIN_ACCESS = {
  manageTournaments: {
    code: 'manage_tournaments',
    label: 'Создание и редактирование турниров',
  },
  uploadTournamentStats: {
    code: 'upload_tournament_stats',
    label: 'Загрузка статистики по турнирам',
  },
  manageAnnouncements: {
    code: 'manage_announcements',
    label: 'Управление объявлениями',
  },
  viewPayments: {
    code: 'view_payments',
    label: 'Просмотр платежей',
  },
  manageUsers: {
    code: 'manage_users',
    label: 'Управление пользователями',
  },
  manageRegistrations: {
    code: 'manage_registrations',
    label: 'Просмотр и управление регистрациями',
  },
};

export const ALL_ADMIN_ACCESS_CODES = Object.values(ADMIN_ACCESS).map((a) => a.code);

export const TOURNAMENT_STATUS = {
  draft: 'draft',
  published: 'published',
  completed: 'completed',
  cancelled: 'cancelled',
};

export const REGISTRATION_STATUS = {
  pending_payment: 'pending_payment',
  confirmed: 'confirmed',
  cancelled: 'cancelled',
  refunded: 'refunded',
  waitlist: 'waitlist',
};

export const PAYMENT_STATUS = {
  pending: 'pending',
  succeeded: 'succeeded',
  failed: 'failed',
  refunded: 'refunded',
};

export const PAYMENT_TYPE = {
  tournament_registration: 'tournament_registration',
};

export const ENV = {
  JWT_KEY: process.env.JWT_KEY || 'dev_jwt_change_me',
  JWT_EXPIRES_DAYS: Number(process.env.JWT_EXPIRES_DAYS) || 30,
  DB_NAME: process.env.DB_NAME || 'pubgarena',
  MONGODB_URI: process.env.MONGODB_URI,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  APP_PUBLIC_URL: process.env.APP_PUBLIC_URL || 'http://localhost:3000',
  SEED_ADMINS_ON_START: process.env.SEED_ADMINS_ON_START !== 'false',
  SEED_ADMIN_1_EMAIL: process.env.SEED_ADMIN_1_EMAIL,
  SEED_ADMIN_1_PASSWORD: process.env.SEED_ADMIN_1_PASSWORD,
  SEED_ADMIN_1_NAME: process.env.SEED_ADMIN_1_NAME,
  SEED_ADMIN_2_EMAIL: process.env.SEED_ADMIN_2_EMAIL,
  SEED_ADMIN_2_PASSWORD: process.env.SEED_ADMIN_2_PASSWORD,
  SEED_ADMIN_2_NAME: process.env.SEED_ADMIN_2_NAME,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: Number(process.env.SMTP_PORT) || 465,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,
  SMTP_FROM: process.env.SMTP_FROM,
};

export const MAX_FIELDS_SIZE_MB = Number(process.env.MAX_FIELDS_SIZE_MB) || 10;

export const IMAGE_PATH = {
  default: './public/images/default',
  tournaments: './public/images/tournaments',
  announcements: './public/images/announcements',
};

export const PHOTOS_COUNT = {
  uploadAtOnce: 5,
};
