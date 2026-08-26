import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { sensitiveAuthRateLimiter } from '../middlewares/rateLimiter.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '../schemas/auth.schema.js';

const router = Router();
const authController = new AuthController();

router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/login', sensitiveAuthRateLimiter, validateRequest(loginSchema), authController.login);
router.post('/logout', authenticate, authController.logout);
router.post('/refresh', authController.refresh);
router.post(
  '/forgot-password',
  sensitiveAuthRateLimiter,
  validateRequest(forgotPasswordSchema),
  authController.forgotPassword,
);
router.post(
  '/reset-password',
  sensitiveAuthRateLimiter,
  validateRequest(resetPasswordSchema),
  authController.resetPassword,
);
router.post('/verify-email', validateRequest(verifyEmailSchema), authController.verifyEmail);
router.get('/me', authenticate, authController.getMe);

export default router;
