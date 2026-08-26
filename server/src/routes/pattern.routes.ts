import { Router } from 'express';
import {
  createPattern,
  getUserPatterns,
  getPatternById,
  updatePattern,
  deletePattern,
  duplicatePattern,
  setDefaultPattern,
} from '../controllers/pattern.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { createPatternSchema, updatePatternSchema } from '../schemas/pattern.schema.js';

const router = Router();

// All pattern routes require user authentication
router.use(authenticate);

router.post('/', validateRequest(createPatternSchema), createPattern);
router.get('/', getUserPatterns);
router.get('/:id', getPatternById);
router.put('/:id', validateRequest(updatePatternSchema), updatePattern);
router.delete('/:id', deletePattern);
router.post('/:id/duplicate', duplicatePattern);
router.patch('/:id/default', setDefaultPattern);

export default router;
