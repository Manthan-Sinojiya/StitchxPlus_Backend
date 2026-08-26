import { Router } from 'express';
import {
  adminGetPages,
  adminGetPageById,
  adminCreatePage,
  adminUpdatePage,
  adminDeletePage,
  adminGetBlockContent,
  adminUpdateBlockContent,
} from '../controllers/content.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

// Protect all admin content endpoints with Authentication and ADMIN Role
router.use(authenticate);
router.use(authorize('ADMIN'));

// Page CRUD
router.get('/pages', adminGetPages);
router.post('/pages', adminCreatePage);
router.get('/pages/:id', adminGetPageById);
router.patch('/pages/:id', adminUpdatePage);
router.delete('/pages/:id', adminDeletePage);

// Site Content Block CRUD (home, nav, footer, announcement, faq, settings)
router.get('/blocks/:key', adminGetBlockContent);
router.put('/blocks/:key', adminUpdateBlockContent);

export default router;
