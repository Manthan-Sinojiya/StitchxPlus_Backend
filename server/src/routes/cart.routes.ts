import { Router } from 'express';
import {
  getCart,
  addItem,
  updateItem,
  removeItem,
  applyCoupon,
  removeCoupon,
  mergeCart,
} from '../controllers/cart.controller.js';
import { authenticate, authenticateOptional } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import {
  addCartItemSchema,
  updateCartItemSchema,
  applyCouponSchema,
} from '../schemas/cart.schema.js';

const router = Router();

// Apply optional authentication across cart routes
router.use(authenticateOptional);

router.get('/', getCart);
router.post('/items', validateRequest(addCartItemSchema), addItem);
router.patch('/items/:id', validateRequest(updateCartItemSchema), updateItem);
router.delete('/items/:id', removeItem);
router.post('/coupon', validateRequest(applyCouponSchema), applyCoupon);
router.delete('/coupon', removeCoupon);
router.post('/merge', authenticate, mergeCart);

export default router;
