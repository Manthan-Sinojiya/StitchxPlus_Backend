import { OrderModel, IOrderDocument } from '../models/order.model.js';
import { ProductModel } from '../models/product.model.js';
import { IPaymentService } from './payment/payment.interface.js';
import { StripePaymentService } from './payment/stripePayment.service.js';
import { CartRepository } from '../repositories/cart.repository.js';
import { CheckoutService } from './checkout.service.js';
import { AppError } from '../utils/appError.js';
import { CreateOrderInput } from '@stitchx/shared';
import { Types } from 'mongoose';

export class OrderService {
  private paymentService: IPaymentService;
  private cartRepository: CartRepository;
  private checkoutService: CheckoutService;

  constructor(paymentService?: IPaymentService) {
    this.paymentService = paymentService || new StripePaymentService();
    this.cartRepository = new CartRepository();
    this.checkoutService = new CheckoutService(this.paymentService);
  }

  /**
   * Creates an order (or retrieves existing pending order) storing immutable line item snapshots
   */
  async createOrder(
    input: CreateOrderInput,
    userId?: string,
    sessionId?: string,
  ): Promise<IOrderDocument> {
    if (!input.shippingAddress || !input.billingAddress) {
      throw new AppError('Shipping and billing addresses are required', 400);
    }

    // Check if an order already exists for this paymentIntentId or orderNumber
    if (input.paymentIntentId || input.orderNumber) {
      const existing = await OrderModel.findOne({
        $or: [
          ...(input.paymentIntentId ? [{ paymentIntentId: input.paymentIntentId }] : []),
          ...(input.orderNumber ? [{ orderNumber: input.orderNumber }] : []),
        ],
      }).exec();

      if (existing) {
        return existing;
      }
    }

    // Otherwise, validate cart and snapshot current items
    const validation = await this.checkoutService.validateCheckout(userId, sessionId);
    if (!validation.isValid) {
      throw new AppError(
        `Order creation failed: items unavailable (${validation.unavailableItems?.join(', ')})`,
        400,
      );
    }

    const orderNumber =
      input.orderNumber ||
      `STX-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const order = await OrderModel.create({
      userId: userId && Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : undefined,
      sessionId: !userId ? sessionId : undefined,
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
      paymentStatus: input.paymentIntentId ? 'paid' : 'pending',
      paymentMethod: input.paymentMethod || 'Stripe',
      paymentIntentId: input.paymentIntentId,
      processedWebhookEvents: [],
    });

    // Decrement stock for inventory-tracked products
    for (const item of validation.items) {
      if (item.productId && Types.ObjectId.isValid(item.productId)) {
        const product = await ProductModel.findById(item.productId);
        if (product && !product.isMadeToOrder && typeof product.stockQuantity === 'number') {
          product.stockQuantity = Math.max(0, product.stockQuantity - item.quantity);
          if (product.stockQuantity === 0) {
            product.inStock = false;
            product.status = 'out_of_stock';
          }
          await product.save();
        }
      }
    }

    // Clear cart upon successful order placement
    await this.cartRepository.clearCart(userId, sessionId);

    // Trigger order confirmation email
    if (order.shippingAddress?.email) {
      const { emailService } = await import('./email.service.js');
      await emailService.sendOrderConfirmationEmail(order, order.shippingAddress.email);
    }

    return order;
  }

  /**
   * Retrieves an order by unique order number
   */
  async getOrderByNumber(
    orderNumber: string,
    userId?: string,
    _sessionId?: string,
  ): Promise<IOrderDocument> {
    const order = await OrderModel.findOne({ orderNumber }).exec();
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // If user is authenticated, ensure ownership matches unless guest session matches
    if (userId && order.userId && order.userId.toString() !== userId) {
      throw new AppError('Forbidden: Access denied to this order', 403);
    }

    return order;
  }

  /**
   * Retrieves all orders for a logged-in user
   */
  async getUserOrders(userId: string): Promise<IOrderDocument[]> {
    if (!userId || !Types.ObjectId.isValid(userId)) {
      throw new AppError('Invalid User ID', 400);
    }

    return OrderModel.find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Retrieves an order by ID or orderNumber, with strict ownership check
   */
  async getOrderById(orderIdOrNumber: string, userId?: string): Promise<IOrderDocument> {
    const isObjectId = Types.ObjectId.isValid(orderIdOrNumber);
    const order = await OrderModel.findOne({
      $or: [
        ...(isObjectId ? [{ _id: orderIdOrNumber }] : []),
        { orderNumber: orderIdOrNumber },
      ],
    }).exec();

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (userId && order.userId && order.userId.toString() !== userId) {
      throw new AppError('Forbidden: You do not have permission to access this order', 403);
    }

    return order;
  }

  /**
   * Cancels an order if in an eligible status
   */
  async cancelOrder(orderIdOrNumber: string, userId?: string): Promise<IOrderDocument> {
    const order = await this.getOrderById(orderIdOrNumber, userId);

    const nonEligibleStatuses = ['SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED', 'shipped', 'delivered', 'cancelled'];
    if (nonEligibleStatuses.includes(order.status)) {
      throw new AppError(`Order cannot be cancelled in status: ${order.status}`, 400);
    }

    order.status = 'CANCELLED' as any;
    await order.save();

    // Trigger cancellation email
    if (order.shippingAddress?.email) {
      const { emailService } = await import('./email.service.js');
      await emailService.sendCancellationEmail(order, order.shippingAddress.email);
    }

    return order;
  }

  /**
   * Processes incoming payment provider Webhook events (Idempotent)
   */
  async processPaymentWebhook(
    rawBody: string | Buffer,
    signatureHeader: string,
  ): Promise<{ success: boolean; idempotent: boolean; eventId: string; order: IOrderDocument }> {
    // 1. Cryptographically verify signature
    const event = this.paymentService.verifyWebhookSignature(rawBody, signatureHeader);

    // 2. Find associated order by paymentIntentId or orderNumber metadata
    const query: any[] = [];
    if (event.paymentIntentId) query.push({ paymentIntentId: event.paymentIntentId });
    if (event.orderNumber) query.push({ orderNumber: event.orderNumber });

    if (query.length === 0) {
      throw new AppError('Payment intent ID or order number missing in webhook payload', 400);
    }

    let order = await OrderModel.findOne({ $or: query }).exec();

    if (!order) {
      throw new AppError(`Order not found for webhook event (Intent: ${event.paymentIntentId})`, 404);
    }

    // 3. Idempotency Check: if eventId has already been processed, return without duplicate execution
    if (order.processedWebhookEvents.includes(event.eventId)) {
      return {
        success: true,
        idempotent: true,
        eventId: event.eventId,
        order,
      };
    }

    // 4. Update order status and record event ID atomically
    order.processedWebhookEvents.push(event.eventId);

    if (event.status === 'paid') {
      order.paymentStatus = 'paid';
      order.status = 'processing';
    } else if (event.status === 'failed') {
      order.paymentStatus = 'failed';
    }

    await order.save();

    // 5. Clear cart and send payment confirmation email when payment succeeds
    if (event.status === 'paid') {
      await this.cartRepository.clearCart(
        order.userId ? order.userId.toString() : undefined,
        order.sessionId,
      );
      if (order.shippingAddress?.email) {
        const { emailService } = await import('./email.service.js');
        await emailService.sendPaymentConfirmationEmail(order, order.shippingAddress.email);
      }
    }

    return {
      success: true,
      idempotent: false,
      eventId: event.eventId,
      order,
    };
  }
}
