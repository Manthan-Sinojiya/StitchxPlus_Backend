import { Router } from 'express';
import { BlogController } from '../controllers/blog.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

// Public routes
router.get('/', BlogController.getBlogs);
router.get('/:slug', BlogController.getBlogBySlug);

// Protected Admin routes
router.post('/', authenticate, authorize('ADMIN'), BlogController.createBlog);
router.put('/:id', authenticate, authorize('ADMIN'), BlogController.updateBlog);
router.delete('/:id', authenticate, authorize('ADMIN'), BlogController.deleteBlog);

export default router;
