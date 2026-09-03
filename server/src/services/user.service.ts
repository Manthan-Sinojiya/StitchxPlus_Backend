import { UserRepository } from '../repositories/user.repository.js';
import { IUserDocument, IUserAddress, UserModel } from '../models/user.model.js';
import { AppError } from '../utils/appError.js';
import { comparePassword, hashPassword } from '../utils/auth.js';
import { UserRole } from '@stitchx/shared';
import { Types } from 'mongoose';

export class UserService {
  constructor(private userRepository: UserRepository = new UserRepository()) {}

  async getAllUsers(): Promise<IUserDocument[]> {
    return this.userRepository.findAll();
  }

  async getUserById(id: string): Promise<IUserDocument> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError(`User with ID ${id} not found`, 404);
    }
    return user;
  }

  async createUser(data: { name: string; email: string; role?: UserRole }): Promise<IUserDocument> {
    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) {
      throw new AppError(`User with email ${data.email} already exists`, 400);
    }
    return this.userRepository.create(data);
  }

  async updateProfile(userId: string, data: { name?: string; phone?: string }): Promise<IUserDocument> {
    const user = await this.getUserById(userId);
    if (data.name) user.name = data.name;
    if (data.phone !== undefined) user.phone = data.phone;
    await user.save();
    return user;
  }

  async getAddresses(userId: string): Promise<IUserAddress[]> {
    const user = await this.getUserById(userId);
    return user.addresses || [];
  }

  async addAddress(userId: string, addressData: Omit<IUserAddress, 'id' | '_id'>): Promise<IUserAddress[]> {
    const user = await this.getUserById(userId);
    if (!user.addresses) user.addresses = [];

    if (addressData.isDefault || user.addresses.length === 0) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
      addressData.isDefault = true;
    }

    user.addresses.push(addressData as any);
    await user.save();
    return user.addresses;
  }

  async updateAddress(
    userId: string,
    addressId: string,
    updateData: Partial<IUserAddress>,
  ): Promise<IUserAddress[]> {
    const user = await this.getUserById(userId);
    const address = user.addresses?.find((a: any) => a._id?.toString() === addressId || a.id === addressId);

    if (!address) {
      throw new AppError('Address not found', 404);
    }

    if (updateData.isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
    }

    Object.assign(address, updateData);
    await user.save();
    return user.addresses;
  }

  async deleteAddress(userId: string, addressId: string): Promise<IUserAddress[]> {
    const user = await this.getUserById(userId);
    user.addresses = user.addresses.filter(
      (a: any) => a._id?.toString() !== addressId && a.id !== addressId,
    );
    await user.save();
    return user.addresses;
  }

  async getWishlist(userId: string): Promise<any[]> {
    const user = await UserModel.findById(userId).populate('wishlist.productId').exec();
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user.wishlist || [];
  }

  async addToWishlist(userId: string, productId: string): Promise<any[]> {
    if (!Types.ObjectId.isValid(productId)) {
      throw new AppError('Invalid Product ID', 400);
    }

    const user = await this.getUserById(userId);
    if (!user.wishlist) user.wishlist = [];

    const exists = user.wishlist.some(
      (item: any) => item.productId.toString() === productId,
    );

    if (!exists) {
      user.wishlist.push({ productId, addedAt: new Date() });
      await user.save();
    }

    return this.getWishlist(userId);
  }

  async removeFromWishlist(userId: string, productId: string): Promise<any[]> {
    const user = await this.getUserById(userId);
    if (user.wishlist) {
      user.wishlist = user.wishlist.filter(
        (item: any) => item.productId.toString() !== productId,
      );
      await user.save();
    }
    return this.getWishlist(userId);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await UserModel.findById(userId).select('+password').exec();
    if (!user) {
      throw new AppError('User profile not found', 404);
    }
    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      throw new AppError('Current password is incorrect', 400);
    }
    user.password = await hashPassword(newPassword);
    await user.save();
  }
}
