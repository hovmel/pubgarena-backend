import express from 'express';
import auth from './auth';
import users from './users';
import tournaments from './tournaments';
import announcements from './announcements';
import admin from './admin';

const router = express.Router();

router.get('/api/', (req, res) => {
  res.json({ status: 'ok', service: 'pubgarena-backend' });
});

/** Простой health-check для браузера. */
router.get('/api/ping', (req, res) => {
  res.type('text/plain').send('pong');
});

router.get('/api/ping', (req, res) => res.json('ping'));

router.use('/api/auth', auth);
router.use('/api/users', users);
router.use('/api/tournaments', tournaments);
router.use('/api/announcements', announcements);
router.use('/api/admin', admin);

export default router;
