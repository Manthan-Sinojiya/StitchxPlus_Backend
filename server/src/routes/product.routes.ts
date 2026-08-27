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

// Public routes (no-cache so admin catalog changes reflect immediately)
router.get('/', cacheControl(0), getProducts);
router.get('/:id/related', cacheControl(0), getRelatedProducts);
router.get('/:id/customization', cacheControl(0), getProductCustomization);
router.get('/:slug', cacheControl(0), getProductBySlug);

// Admin-only routes
router.post('/', authenticate, authorize('ADMIN'), createProduct);
router.patch('/:id', authenticate, authorize('ADMIN'), updateProduct);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteProduct);

export default router;
