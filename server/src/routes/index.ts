import { Router } from 'express';
import healthRoutes from './health.routes.js';
import userRoutes from './user.routes.js';
import authRoutes from './auth.routes.js';
import productRoutes from './product.routes.js';
import categoryRoutes from './category.routes.js';
import customizationRoutes from './customization.routes.js';
import patternRoutes from './pattern.routes.js';
import cartRoutes from './cart.routes.js';
import checkoutRoutes from './checkout.routes.js';
import paymentRoutes from './payment.routes.js';
import orderRoutes from './order.routes.js';
import adminRoutes from './admin.routes.js';
import contentRoutes from './content.routes.js';
import adminContentRoutes from './adminContent.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/customizations', customizationRoutes);
router.use('/patterns', patternRoutes);
router.use('/cart', cartRoutes);
router.use('/checkout', checkoutRoutes);
router.use('/payments', paymentRoutes);
router.use('/orders', orderRoutes);
router.use('/admin/content', adminContentRoutes);
router.use('/admin', adminRoutes);
router.use('/', contentRoutes);

// Mount /v1 router for /api/v1/... compatibility
const v1Router = Router();
v1Router.use('/auth', authRoutes);
v1Router.use('/users', userRoutes);
v1Router.use('/products', productRoutes);
v1Router.use('/categories', categoryRoutes);
v1Router.use('/customizations', customizationRoutes);
v1Router.use('/patterns', patternRoutes);
v1Router.use('/cart', cartRoutes);
v1Router.use('/checkout', checkoutRoutes);
v1Router.use('/payments', paymentRoutes);
v1Router.use('/orders', orderRoutes);
v1Router.use('/admin/content', adminContentRoutes);
v1Router.use('/admin', adminRoutes);
v1Router.use('/health', healthRoutes);
v1Router.use('/', contentRoutes);

router.use('/v1', v1Router);

export default router;
