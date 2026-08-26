import { CartRepository } from '../repositories/cart.repository.js';
import { CustomizationService } from './customization.service.js';
import { CouponService } from './coupon.service.js';
import { ProductModel } from '../models/product.model.js';
import { AppError } from '../utils/appError.js';
import { ICartDocument } from '../models/cart.model.js';

export class CartService {
  private cartRepository: CartRepository;
  private customizationService: CustomizationService;
  private couponService: CouponService;

  constructor() {
    this.cartRepository = new CartRepository();
    this.customizationService = new CustomizationService();
    this.couponService = new CouponService();
  }

  /**
   * Recalculates authoritative line item prices and cart totals dynamically
   */
  private async formatAndCalculateCart(cartDoc: ICartDocument): Promise<any> {
    let subtotal = 0;
    const formattedItems = [];

    for (const item of cartDoc.items) {
      const product = item.productId as any;
      if (!product) continue;

      let unitPrice = product.basePrice || 0;
      let calculatedCustomization = item.customization;

      // Authoritative Price Calculation for customized items
      if (item.customization && item.customization.selectedOptions) {
        try {
          const priceCalc = await this.customizationService.calculatePrice(
            product._id?.toString() || product.id,
            item.customization.selectedOptions,
            product.basePrice,
          );

          unitPrice = priceCalc.totalPrice;
          calculatedCustomization = {
            selectedOptions: item.customization.selectedOptions,
            optionAdjustments: priceCalc.optionAdjustments,
            basePrice: priceCalc.basePrice,
            totalPrice: priceCalc.totalPrice,
          };
        } catch (_err) {
          // Fallback to base price if customization pricing fails
        }
      }

      const itemTotal = unitPrice * item.quantity;
      subtotal += itemTotal;

      formattedItems.push({
        id: item._id?.toString(),
        productId: product._id?.toString() || product.id,
        product: {
          id: product._id?.toString() || product.id,
          name: product.name,
          slug: product.slug,
          basePrice: product.basePrice,
          images: product.images || [],
          sku: product.sku,
        },
        quantity: item.quantity,
        priceAtAddition: item.priceAtAddition,
        unitPrice,
        totalPrice: itemTotal,
        customization: calculatedCustomization,
        measurementProfile: item.measurementProfile,
      });
    }

    // Handle Coupon Discount
    let discount = 0;
    let validCoupon = null;

    if (cartDoc.couponCode) {
      try {
        const { coupon, discountAmount } = await this.couponService.validateAndCalculateDiscount(
          cartDoc.couponCode,
          subtotal,
        );
        discount = discountAmount;
        validCoupon = {
          id: coupon.id,
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          minOrderValue: coupon.minOrderValue,
        };
      } catch (_err) {
        // If subtotal drops below coupon minimum value or coupon expires, strip coupon code
        cartDoc.couponCode = undefined;
        await cartDoc.save();
      }
    }

    // Estimate shipping ($25 flat, complimentary over $500)
    const shipping = subtotal > 500 || subtotal === 0 ? 0 : 25;
    const total = Math.max(0, Math.round((subtotal - discount + shipping) * 100) / 100);

    return {
      id: cartDoc._id?.toString(),
      userId: cartDoc.userId?.toString(),
      sessionId: cartDoc.sessionId,
      items: formattedItems,
      couponCode: cartDoc.couponCode || null,
      coupon: validCoupon,
      subtotal: Math.round(subtotal * 100) / 100,
      discount: Math.round(discount * 100) / 100,
      shipping,
      total,
      createdAt: cartDoc.createdAt,
      updatedAt: cartDoc.updatedAt,
    };
  }

  async getCart(userId?: string, sessionId?: string): Promise<any> {
    const cart = await this.cartRepository.findOrCreateCart(userId, sessionId);
    return this.formatAndCalculateCart(cart);
  }

  async addItem(userId?: string, sessionId?: string, input?: any): Promise<any> {
    if (!input || !input.productId) {
      throw new AppError('Product ID is required', 400);
    }

    const product = await ProductModel.findById(input.productId).exec();
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    const quantity = Math.max(1, input.quantity || 1);
    let unitPrice = product.basePrice || 0;
    let customizationData = input.customization;

    if (input.customization && input.customization.selectedOptions) {
      const priceCalc = await this.customizationService.calculatePrice(
        product.id,
        input.customization.selectedOptions,
        product.basePrice,
      );

      unitPrice = priceCalc.totalPrice;
      customizationData = {
        selectedOptions: input.customization.selectedOptions,
        optionAdjustments: priceCalc.optionAdjustments,
        basePrice: priceCalc.basePrice,
        totalPrice: priceCalc.totalPrice,
      };
    }

    const cart = await this.cartRepository.findOrCreateCart(userId, sessionId);

    // Check if matching item exists (same productId + customization + measurement)
    const existingIndex = cart.items.findIndex((item) => {
      if (item.productId.toString() !== input.productId) return false;
      const optsA = item.customization?.selectedOptions || {};
      const optsB = input.customization?.selectedOptions || {};
      if (JSON.stringify(optsA) !== JSON.stringify(optsB)) return false;

      const measA = item.measurementProfile || {};
      const measB = input.measurementProfile || {};
      if (JSON.stringify(measA) !== JSON.stringify(measB)) return false;

      return true;
    });

    if (existingIndex >= 0) {
      cart.items[existingIndex].quantity += quantity;
    } else {
      cart.items.push({
        productId: product._id,
        quantity,
        priceAtAddition: unitPrice,
        customization: customizationData,
        measurementProfile: input.measurementProfile,
      } as any);
    }

    const updatedCart = await this.cartRepository.saveCart(cart);
    return this.formatAndCalculateCart(updatedCart);
  }

  async updateItem(userId?: string, sessionId?: string, itemId?: string, input?: any): Promise<any> {
    if (!itemId) {
      throw new AppError('Cart item ID is required', 400);
    }
    const cart = await this.cartRepository.getCartByOwner(userId, sessionId);
    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    const item = cart.items.id(itemId);
    if (!item) {
      throw new AppError('Cart item not found', 404);
    }

    if (input.quantity !== undefined) {
      if (input.quantity <= 0) {
        cart.items.pull({ _id: itemId });
      } else {
        item.quantity = input.quantity;
      }
    }

    if (input.customization) {
      item.customization = input.customization;
    }

    if (input.measurementProfile) {
      item.measurementProfile = input.measurementProfile;
    }

    const updatedCart = await this.cartRepository.saveCart(cart);
    return this.formatAndCalculateCart(updatedCart);
  }

  async removeItem(userId?: string, sessionId?: string, itemId?: string): Promise<any> {
    const cart = await this.cartRepository.getCartByOwner(userId, sessionId);
    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    cart.items.pull({ _id: itemId });
    const updatedCart = await this.cartRepository.saveCart(cart);
    return this.formatAndCalculateCart(updatedCart);
  }

  async applyCoupon(userId?: string, sessionId?: string, code?: string): Promise<any> {
    if (!code) {
      throw new AppError('Coupon code is required', 400);
    }

    const cart = await this.cartRepository.findOrCreateCart(userId, sessionId);

    // Calculate subtotal to validate coupon
    let subtotal = 0;
    for (const item of cart.items) {
      const product = item.productId as any;
      if (!product) continue;
      let unitPrice = product.basePrice || product.price || 0;
      if (item.customization && item.customization.selectedOptions) {
        try {
          const priceCalc = await this.customizationService.calculatePrice(
            product._id?.toString() || product.id,
            item.customization.selectedOptions,
            product.basePrice || product.price,
          );
          unitPrice = priceCalc.totalPrice;
        } catch (_err) {}
      }
      subtotal += unitPrice * item.quantity;
    }

    // Validate coupon
    await this.couponService.validateAndCalculateDiscount(code, subtotal);

    cart.couponCode = code.toUpperCase().trim();
    const updatedCart = await this.cartRepository.saveCart(cart);
    return this.formatAndCalculateCart(updatedCart);
  }

  async removeCoupon(userId?: string, sessionId?: string): Promise<any> {
    const cart = await this.cartRepository.getCartByOwner(userId, sessionId);
    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    cart.couponCode = undefined;
    const updatedCart = await this.cartRepository.saveCart(cart);
    return this.formatAndCalculateCart(updatedCart);
  }

  async mergeCarts(guestSessionId: string, userId: string): Promise<any> {
    const mergedDoc = await this.cartRepository.mergeCarts(guestSessionId, userId);
    return this.formatAndCalculateCart(mergedDoc);
  }
}
