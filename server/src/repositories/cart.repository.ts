import { CartModel, ICartDocument, ICartItem } from '../models/cart.model.js';
import { Types } from 'mongoose';

export class CartRepository {
  async getCartByOwner(userId?: string, sessionId?: string): Promise<ICartDocument | null> {
    if (userId && Types.ObjectId.isValid(userId)) {
      let userCart = await CartModel.findOne({ userId: new Types.ObjectId(userId) })
        .populate('items.productId')
        .exec();

      if (sessionId && (!userCart || userCart.items.length === 0)) {
        const guestCart = await CartModel.findOne({ sessionId }).exec();
        if (guestCart && guestCart.items.length > 0) {
          return this.mergeCarts(sessionId, userId);
        }
      }

      if (userCart) return userCart;
    }
    if (sessionId) {
      return CartModel.findOne({ sessionId }).populate('items.productId').exec();
    }
    return null;
  }

  async findOrCreateCart(userId?: string, sessionId?: string): Promise<ICartDocument> {
    let cart = await this.getCartByOwner(userId, sessionId);
    if (!cart) {
      cart = new CartModel({
        userId: userId && Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : undefined,
        sessionId: !userId ? sessionId : undefined,
        items: [],
      });
      await cart.save();
      // Re-populate product references
      cart = await CartModel.findById(cart._id).populate('items.productId').exec();
    }
    return cart!;
  }

  async saveCart(cart: ICartDocument): Promise<ICartDocument> {
    await cart.save();
    const updated = await CartModel.findById(cart._id).populate('items.productId').exec();
    return updated || cart;
  }

  async deleteCart(cartId: string): Promise<void> {
    await CartModel.deleteOne({ _id: cartId }).exec();
  }

  async clearCart(userId?: string, sessionId?: string): Promise<void> {
    const cart = await this.getCartByOwner(userId, sessionId);
    if (cart) {
      cart.items.splice(0, cart.items.length);
      cart.couponCode = undefined;
      await cart.save();
    }
  }

  /**
   * Deep equality checker for customization selectedOptions and measurement snapshot
   */
  private isSameConfiguration(itemA: ICartItem, itemB: ICartItem): boolean {
    if (itemA.productId.toString() !== itemB.productId.toString()) {
      return false;
    }

    const optsA = itemA.customization?.selectedOptions || {};
    const optsB = itemB.customization?.selectedOptions || {};
    if (JSON.stringify(optsA) !== JSON.stringify(optsB)) {
      return false;
    }

    const measA = itemA.measurementProfile || {};
    const measB = itemB.measurementProfile || {};
    if (JSON.stringify(measA) !== JSON.stringify(measB)) {
      return false;
    }

    return true;
  }

  /**
   * Merges guest cart into user saved cart on login
   */
  async mergeCarts(guestSessionId: string, userId: string): Promise<ICartDocument> {
    const userObjectId = new Types.ObjectId(userId);
    const guestCart = await CartModel.findOne({ sessionId: guestSessionId }).exec();

    let userCart = await CartModel.findOne({ userId: userObjectId }).exec();

    if (!guestCart || guestCart.items.length === 0) {
      if (!userCart) {
        userCart = new CartModel({ userId: userObjectId, items: [] });
        await userCart.save();
      }
      return (await CartModel.findById(userCart._id).populate('items.productId').exec())!;
    }

    if (!userCart) {
      // Re-assign guest cart to user
      guestCart.userId = userObjectId;
      (guestCart as any).sessionId = undefined;
      await guestCart.save();
      return (await CartModel.findById(guestCart._id).populate('items.productId').exec())!;
    }

    // Merge items from guestCart into userCart
    for (const gItem of guestCart.items) {
      const matchIndex = userCart.items.findIndex((uItem: any) =>
        this.isSameConfiguration(uItem, gItem),
      );

      if (matchIndex >= 0) {
        // Combine quantity for identical configuration & measurements
        userCart.items[matchIndex].quantity += gItem.quantity;
      } else {
        // Pushing as separate line item
        userCart.items.push({
          productId: gItem.productId,
          quantity: gItem.quantity,
          priceAtAddition: gItem.priceAtAddition,
          customization: gItem.customization,
          measurementProfile: gItem.measurementProfile,
        } as any);
      }
    }

    // Preserve coupon code if set on guest cart and user cart doesn't have one
    if (guestCart.couponCode && !userCart.couponCode) {
      userCart.couponCode = guestCart.couponCode;
    }

    await userCart.save();
    await CartModel.deleteOne({ _id: guestCart._id }).exec();

    return (await CartModel.findById(userCart._id).populate('items.productId').exec())!;
  }
}
