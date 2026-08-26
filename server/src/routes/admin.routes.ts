import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { adminController } from '../controllers/admin.controller.js';

const router = Router();

// Strict security: require valid JWT & ADMIN or STAFF role for all admin routes
router.use(authenticate);
router.use(authorize('ADMIN', 'STAFF'));

// Dashboard summary stats & analytics
router.get('/stats', adminController.getDashboardStats);
router.get('/analytics', adminController.getDashboardStats);

// Orders management
router.get('/orders', adminController.getOrders);
router.patch('/orders/:id/status', adminController.updateOrderStatus);
router.put('/orders/:id/status', adminController.updateOrderStatus);

// Customer management
router.get('/customers', adminController.getCustomers);
router.get('/customers/:id', adminController.getCustomerDetail);

// Categories management
router.get('/categories', adminController.getCategories);
router.post('/categories', adminController.createCategory);
router.put('/categories/:id', adminController.updateCategory);
router.patch('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// Customization options management (mapped to both /customizations and /customization-options)
router.get('/customizations', adminController.getCustomizationGroups);
router.get('/customization-options', adminController.getCustomizationGroups);
router.post('/customizations', adminController.createCustomizationGroup);
router.post('/customization-options', adminController.createCustomizationGroup);
router.put('/customizations/:id', adminController.updateCustomizationGroup);
router.put('/customization-options/:id', adminController.updateCustomizationGroup);
router.patch('/customizations/:id', adminController.updateCustomizationGroup);
router.patch('/customization-options/:id', adminController.updateCustomizationGroup);
router.delete('/customizations/:id', adminController.deleteCustomizationGroup);
router.delete('/customization-options/:id', adminController.deleteCustomizationGroup);

// Coupon management
router.get('/coupons', adminController.getCoupons);
router.post('/coupons', adminController.createCoupon);
router.put('/coupons/:id', adminController.updateCoupon);
router.patch('/coupons/:id', adminController.updateCoupon);
router.delete('/coupons/:id', adminController.deleteCoupon);

// Product management
router.get('/products', adminController.getProducts);
router.post('/products', adminController.createProduct);
router.put('/products/:id', adminController.updateProduct);
router.patch('/products/:id', adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);

// Audit log view
router.get('/audit-logs', adminController.getAuditLogs);

// Reviews management
router.get('/reviews', adminController.getReviews);

// Fabric management
router.get('/fabrics', adminController.getFabrics);
router.post('/fabrics', adminController.createFabric);
router.put('/fabrics/:id', adminController.updateFabric);
router.patch('/fabrics/:id', adminController.updateFabric);
router.delete('/fabrics/:id', adminController.deleteFabric);

// Cloudinary image upload signature & deletion
router.get('/cloudinary-signature', adminController.getUploadSignature);
router.post('/cloudinary-delete', adminController.deleteCloudinaryAsset);

export default router;
