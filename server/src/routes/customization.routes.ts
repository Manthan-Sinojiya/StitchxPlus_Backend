import { Router } from 'express';
import {
  getProductCustomization,
  calculateCustomizationPrice,
  validateCustomizationConfig,
} from '../controllers/customization.controller.js';

const router = Router();

// Public Customization API endpoints
router.get('/products/:id', getProductCustomization);
router.post('/price', calculateCustomizationPrice);
router.post('/validate', validateCustomizationConfig);

export default router;
