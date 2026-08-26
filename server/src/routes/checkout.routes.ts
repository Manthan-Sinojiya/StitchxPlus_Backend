import { Router } from 'express';
import { CheckoutController } from '../controllers/checkout.controller.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { createPaymentSchema } from '../schemas/checkout.schema.js';
import { authenticateOptional } from '../middlewares/auth.middleware.js';

const router = Router();
const controller = new CheckoutController();

router.post('/validate', authenticateOptional, controller.validate);
router.post('/create-payment', authenticateOptional, validateRequest(createPaymentSchema), controller.createPayment);

export default router;
