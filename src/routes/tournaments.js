import express from 'express';
import TournamentsController from '../controllers/TournamentsController';
import authUser from '../middlewares/authUser';

const router = express.Router();

router.get('/', TournamentsController.list);
router.get('/mine', authUser(), TournamentsController.mine);
router.get('/:id/games', TournamentsController.games);
router.get('/:id', TournamentsController.getOne);
router.post('/:id/register', authUser(), TournamentsController.registerCheckout);

export default router;
