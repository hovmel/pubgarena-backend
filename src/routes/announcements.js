import express from 'express';
import AnnouncementsController from '../controllers/AnnouncementsController';

const router = express.Router();

router.get('/', AnnouncementsController.list);

export default router;
