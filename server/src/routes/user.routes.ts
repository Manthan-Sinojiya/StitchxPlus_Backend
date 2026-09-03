import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();
const userController = new UserController();

// User Me Profile
router.get('/me', authenticate, userController.getMe);
router.patch('/me', authenticate, userController.updateMe);
router.put('/me/password', authenticate, userController.changePassword);

// Address Book Routes
router.get('/me/addresses', authenticate, userController.getAddresses);
router.post('/me/addresses', authenticate, userController.addAddress);
router.patch('/me/addresses/:addressId', authenticate, userController.updateAddress);
router.delete('/me/addresses/:addressId', authenticate, userController.deleteAddress);

// Wishlist Routes
router.get('/me/wishlist', authenticate, userController.getWishlist);
router.post('/me/wishlist/:productId', authenticate, userController.addToWishlist);
router.delete('/me/wishlist/:productId', authenticate, userController.removeFromWishlist);

// Admin / General User Management
router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);

export default router;
