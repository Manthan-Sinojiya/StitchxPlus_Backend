import { CartService } from './cart.service.js';
import { IPaymentService } from './payment/payment.interface.js';
import { StripePaymentService } from './payment/stripePayment.service.js';
import { ProductModel } from '../models/product.model.js';
import { OrderModel } from '../models/order.model.js';
import { AppError } from '../utils/appError.js';
import { CheckoutValidateResult, CreatePaymentInput, CreatePaymentResult } from '@stitchx/shared';

export class CheckoutService {
  private cartService: CartService;
  private paymentService: IPaymentService;

  constructor(paymentService?: IPaymentService) {
    this.cartService = new CartService();
    this.paymentService = paymentService || new StripePaymentService();
  }

  /**
   * Re-verifies product availability and recalculates the authoritative total before payment
   */
  async validateCheckout(userId?: string, sessionId?: string): Promise<CheckoutValidateResult> {
    const cart = await this.cartService.getCart(userId, sessionId);

    if (!cart || !cart.items || cart.items.length === 0) {
      throw new AppError('Shopping cart is empty', 400);
    }

    const unavailableItems: string[] = [];
    const validatedItems = [];

    for (const item of cart.items) {
      const product = await ProductModel.findById(item.productId).exec();
      if (!product || !product.inStock) {
        unavailableItems.push(item.product?.name || item.productId);
      } else {
        validatedItems.push({
          productId: product._id.toString(),
          product: {
            id: product._id.toString(),
            name: product.name,
            slug: product.slug,
            sku: product.sku,
            basePrice: product.basePrice,
            image: product.images && product.images.length > 0 ? product.images[0] : undefined,
          },
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          selectedColor: item.selectedColor,
          selectedSize: item.selectedSize,
          customization: item.customization,
          measurementProfile: item.measurementProfile,
        });
      }
    }

    const isValid = unavailableItems.length === 0;

    return {
      isValid,
      subtotal: cart.subtotal,
      discount: cart.discount,
      shipping: cart.shipping,
      totalAmount: cart.total,
      itemCount: cart.items.reduce((acc: number, item: any) => acc + item.quantity, 0),
      items: validatedItems,
      couponCode: cart.couponCode,
      unavailableItems: isValid ? undefined : unavailableItems,
    };
  }

  /**
   * Re-verifies price & availability, creates payment intent with payment service, and prepares pending order
   */
  async createPayment(
    userId?: string,
    sessionId?: string,
    input?: CreatePaymentInput,
  ): Promise<CreatePaymentResult> {
    if (!input || !input.shippingAddress || !input.billingAddress) {
      throw new AppError('Shipping and billing addresses are required', 400);
    }

    // 1. Re-validate cart and authoritative pricing
    const validation = await this.validateCheckout(userId, sessionId);
    if (!validation.isValid) {
      throw new AppError(
        `Checkout validation failed: unavailable items (${validation.unavailableItems?.join(', ')})`,
        400,
      );
    }

    // 2. Generate unique order number
    const timestamp = Date.now().toString(36).toUpperCase();
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderNumber = `STX-${timestamp}-${randomHex}`;

    // 3. Create payment intent via payment provider
    const amountInCents = Math.round(validation.totalAmount * 100);
    const paymentIntent = await this.paymentService.createPaymentIntent({
      amount: amountInCents,
      currency: 'usd',
      orderNumber,
      customerEmail: input.shippingAddress.email,
      metadata: {
        orderNumber,
        userId: userId || '',
        sessionId: sessionId || '',
      },
    });

    // 4. Create pending order document holding item snapshots
    await OrderModel.create({
      userId: userId ? (userId as any) : undefined,
      sessionId: sessionId || undefined,
      orderNumber,
      items: validation.items,
      shippingAddress: input.shippingAddress,
      billingAddress: input.billingAddress,
      shippingMethod: input.shippingMethod || 'Standard Express (3-5 Days)',
      subtotal: validation.subtotal,
      discount: validation.discount,
      shipping: validation.shipping,
      totalAmount: validation.totalAmount,
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod: 'Stripe',
      paymentIntentId: paymentIntent.paymentIntentId,
      processedWebhookEvents: [],
    });

    return {
      orderNumber,
      clientSecret: paymentIntent.clientSecret,
      paymentIntentId: paymentIntent.paymentIntentId,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      totalAmount: validation.totalAmount,
    };
  }
}
