import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller.js';

const router = Router();
const controller = new PaymentController();

router.post('/webhook', controller.webhook);

export default router;
