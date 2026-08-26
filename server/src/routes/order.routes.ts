import { Router } from 'express';
import { OrderController } from '../controllers/order.controller.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { createOrderSchema } from '../schemas/checkout.schema.js';
import { authenticate, authenticateOptional } from '../middlewares/auth.middleware.js';

const router = Router();
const controller = new OrderController();

router.post('/', authenticateOptional, validateRequest(createOrderSchema), controller.createOrder);
router.get('/my-orders', authenticate, controller.getUserOrders);
router.get('/:id', authenticateOptional, controller.getOrderById);
router.post('/:id/cancel', authenticate, controller.cancelOrder);

export default router;
