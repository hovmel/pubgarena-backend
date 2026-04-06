import express from 'express';
import UsersController from '../controllers/UsersController';
import authUser from '../middlewares/authUser';

const router = express.Router();

router.get('/me', authUser(), UsersController.me);
router.patch('/me', authUser(), UsersController.updateMe);
router.get('/me/tournament-stats', authUser(), UsersController.myTournamentStatsHistory);
router.get('/me/telegram-access', authUser(), UsersController.telegramAccess);

export default router;
