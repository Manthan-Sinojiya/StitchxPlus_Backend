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

// Public Read Endpoints (No-Cache for real-time Admin updates)
router.get('/pages/:slug', cacheControl(0), getPublicPageBySlug);
router.get('/content/home', cacheControl(0), getPublicHomeContent);
router.get('/content/nav', cacheControl(0), getPublicNavContent);
router.get('/content/footer', cacheControl(0), getPublicFooterContent);
router.get('/content/announcement', cacheControl(0), getPublicAnnouncementContent);
router.get('/content/settings', cacheControl(0), getPublicSettingsContent);
router.get('/faq', cacheControl(0), getPublicFaqContent);

export default router;
