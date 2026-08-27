import { Router } from 'express';
import {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';

import { cacheControl } from '../middlewares/cacheControl.middleware.js';

const router = Router();

// Public routes
router.get('/', cacheControl(0), getCategories);
router.get('/:slug', cacheControl(0), getCategoryBySlug);

// Admin-only routes
router.post('/', authenticate, authorize('ADMIN'), createCategory);
router.patch('/:id', authenticate, authorize('ADMIN'), updateCategory);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteCategory);

export default router;
