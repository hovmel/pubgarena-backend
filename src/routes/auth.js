import express from 'express';
import AuthController from '../controllers/AuthController';

const router = express.Router();

router.post('/register', AuthController.register);
router.post('/register/confirm', AuthController.registerConfirm);
router.post('/login', AuthController.loginUser);
router.post('/admin/login', AuthController.loginAdmin);

export default router;
