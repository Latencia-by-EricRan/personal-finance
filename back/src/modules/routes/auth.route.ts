// start path: /auth
import { Router } from 'express';
import { loginValidator } from '../validators/auth.validator';
import { login } from '../controllers/auth.controller';

const router = Router();

router.post('/login', loginValidator, login);

export default router;
