import express from 'express';
import userValidation from '../validation/user.js';
import { signin, registerUser, changePassword } from '../controllers/user.js';

const router = express.Router();

// Single API for multi-step signup
router.post('/register', registerUser);

router.post('/signin', userValidation, signin);
router.post('/changepassword', changePassword);

export default router;
