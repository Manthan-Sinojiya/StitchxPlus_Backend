import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service.js';
import { sendSuccess } from '../utils/response.js';

export class UserController {
  constructor(private userService: UserService = new UserService()) {}

  public getUsers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await this.userService.getAllUsers();
      sendSuccess(res, users, 'Users retrieved successfully');
    } catch (err) {
      next(err);
    }
  };

  public getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.userService.getUserById(req.params.id);
      sendSuccess(res, user, 'User profile retrieved successfully');
    } catch (err) {
      next(err);
    }
  };

  public createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.userService.createUser(req.body);
      sendSuccess(res, user, 'User created successfully', 201);
    } catch (err) {
      next(err);
    }
  };

  public getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId || (req as any).user?.id;
      const user = await this.userService.getUserById(userId);
      sendSuccess(res, user, 'User profile retrieved successfully');
    } catch (err) {
      next(err);
    }
  };

  public updateMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId || (req as any).user?.id;
      const updated = await this.userService.updateProfile(userId, req.body);
      sendSuccess(res, updated, 'Profile updated successfully');
    } catch (err) {
      next(err);
    }
  };

  public getAddresses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId || (req as any).user?.id;
      const addresses = await this.userService.getAddresses(userId);
      sendSuccess(res, addresses, 'Addresses retrieved successfully');
    } catch (err) {
      next(err);
    }
  };

  public addAddress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId || (req as any).user?.id;
      const addresses = await this.userService.addAddress(userId, req.body);
      sendSuccess(res, addresses, 'Address added successfully', 201);
    } catch (err) {
      next(err);
    }
  };

  public updateAddress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId || (req as any).user?.id;
      const { addressId } = req.params;
      const addresses = await this.userService.updateAddress(userId, addressId, req.body);
      sendSuccess(res, addresses, 'Address updated successfully');
    } catch (err) {
      next(err);
    }
  };

  public deleteAddress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId || (req as any).user?.id;
      const { addressId } = req.params;
      const addresses = await this.userService.deleteAddress(userId, addressId);
      sendSuccess(res, addresses, 'Address deleted successfully');
    } catch (err) {
      next(err);
    }
  };

  public getWishlist = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId || (req as any).user?.id;
      const wishlist = await this.userService.getWishlist(userId);
      sendSuccess(res, wishlist, 'Wishlist retrieved successfully');
    } catch (err) {
      next(err);
    }
  };

  public addToWishlist = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId || (req as any).user?.id;
      const { productId } = req.params;
      const wishlist = await this.userService.addToWishlist(userId, productId);
      sendSuccess(res, wishlist, 'Product added to wishlist');
    } catch (err) {
      next(err);
    }
  };

  public removeFromWishlist = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId || (req as any).user?.id;
      const { productId } = req.params;
      const wishlist = await this.userService.removeFromWishlist(userId, productId);
      sendSuccess(res, wishlist, 'Product removed from wishlist');
    } catch (err) {
      next(err);
    }
  };
}
