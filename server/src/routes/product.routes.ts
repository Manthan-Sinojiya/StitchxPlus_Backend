import { Router } from 'express';
import {
  getProducts,
  getProductBySlug,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller.js';
import { getProductCustomization } from '../controllers/customization.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';

import { cacheControl } from '../middlewares/cacheControl.middleware.js';

const router = Router();

// Public routes with Cache-Control headers
router.get('/', cacheControl(300), getProducts);
router.get('/:id/related', cacheControl(300), getRelatedProducts);
router.get('/:id/customization', cacheControl(300), getProductCustomization);
router.get('/:slug', cacheControl(300), getProductBySlug);

// Admin-only routes
router.post('/', authenticate, authorize('ADMIN'), createProduct);
router.patch('/:id', authenticate, authorize('ADMIN'), updateProduct);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteProduct);

export default router;
