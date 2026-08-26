import { Router } from 'express';
import {
  getPublicPageBySlug,
  getPublicHomeContent,
  getPublicNavContent,
  getPublicFooterContent,
  getPublicAnnouncementContent,
  getPublicSettingsContent,
  getPublicFaqContent,
} from '../controllers/content.controller.js';
import { cacheControl } from '../middlewares/cacheControl.middleware.js';

const router = Router();

// Public Read Endpoints (With Cache-Control header)
router.get('/pages/:slug', cacheControl(300), getPublicPageBySlug);
router.get('/content/home', cacheControl(300), getPublicHomeContent);
router.get('/content/nav', cacheControl(300), getPublicNavContent);
router.get('/content/footer', cacheControl(300), getPublicFooterContent);
router.get('/content/announcement', cacheControl(300), getPublicAnnouncementContent);
router.get('/content/settings', cacheControl(300), getPublicSettingsContent);
router.get('/faq', cacheControl(300), getPublicFaqContent);

export default router;
