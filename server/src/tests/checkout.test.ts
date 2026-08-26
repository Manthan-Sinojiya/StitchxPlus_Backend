import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app.js';
import { ProductModel } from '../models/product.model.js';
import { OrderModel } from '../models/order.model.js';
import { StripePaymentService } from '../services/payment/stripePayment.service.js';

let mongoServer: MongoMemoryServer;
let sampleProductId: string;
let outOfStockProductId: string;
const guestSessionId = 'checkout_guest_session_999';
const paymentService = new StripePaymentService();

const sampleAddress = {
  firstName: 'Charles',
  lastName: 'Bespoke',
  street: '742 Evergreen Terrace',
  apartment: 'Suite 4B',
  city: 'New York',
  state: 'NY',
  zipCode: '10001',
  country: 'USA',
  phone: '+1 212-555-0199',
  email: 'charles@example.com',
};

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  // Seed sample in-stock product
  const product = await ProductModel.create({
    name: 'The Sovereign Tuxedo',
    slug: 'the-sovereign-tuxedo',
    description: 'Bespoke Italian Barathea Wool Tuxedo',
    basePrice: 1200,
    images: ['https://example.com/sovereign.jpg'],
    sku: 'SOV-TUX-001',
    category: new mongoose.Types.ObjectId(),
    inStock: true,
    isActive: true,
  });
  sampleProductId = product.id;

  // Seed out-of-stock product
  const outOfStock = await ProductModel.create({
    name: 'Limited Velvet Dinner Jacket',
    slug: 'limited-velvet-dinner-jacket',
    description: 'Hand-woven Silk Velvet Jacket',
    basePrice: 1500,
    images: ['https://example.com/velvet.jpg'],
    sku: 'VEL-JCK-002',
    category: new mongoose.Types.ObjectId(),
    inStock: false,
    isActive: true,
  });
  outOfStockProductId = outOfStock.id;
}, 30000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Checkout & Payment Processing Integration Tests', () => {
  it('1. POST /api/v1/checkout/validate - Validates cart with active items and calculates authoritative total', async () => {
    // Add item to cart first
    await request(app)
      .post('/api/v1/cart/items')
      .set('X-Session-ID', guestSessionId)
      .send({
        productId: sampleProductId,
        quantity: 1,
        customization: { selectedOptions: { lapel: 'peak' } },
        measurementProfile: { name: 'Formal Fitting', chest: 40, waist: 32 },
      });

    const res = await request(app)
      .post('/api/v1/checkout/validate')
      .set('X-Session-ID', guestSessionId);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isValid).toBe(true);
    expect(res.body.data.totalAmount).toBe(1200); // 1200 + 0 shipping (>500)
    expect(res.body.data.items.length).toBe(1);
  });

  it('2. POST /api/v1/checkout/validate - Re-verifies and flags unavailable out-of-stock products', async () => {
    const outOfStockSessionId = 'out_of_stock_session_111';

    // Add out-of-stock item
    await request(app)
      .post('/api/v1/cart/items')
      .set('X-Session-ID', outOfStockSessionId)
      .send({
        productId: outOfStockProductId,
        quantity: 1,
      });

    const res = await request(app)
      .post('/api/v1/checkout/validate')
      .set('X-Session-ID', outOfStockSessionId);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isValid).toBe(false);
    expect(res.body.data.unavailableItems).toContain('Limited Velvet Dinner Jacket');
  });

  it('3. POST /api/v1/checkout/create-payment - Creates payment intent & pending order', async () => {
    const res = await request(app)
      .post('/api/v1/checkout/create-payment')
      .set('X-Session-ID', guestSessionId)
      .send({
        shippingAddress: sampleAddress,
        billingAddress: sampleAddress,
        shippingMethod: 'Express Courier',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.clientSecret).toBeDefined();
    expect(res.body.data.paymentIntentId).toMatch(/^pi_stitchx_/);
    expect(res.body.data.orderNumber).toMatch(/^STX-/);
    expect(res.body.data.totalAmount).toBe(1200);

    // Verify order saved in database with status pending
    const order = await OrderModel.findOne({ orderNumber: res.body.data.orderNumber });
    expect(order).toBeDefined();
    expect(order?.paymentStatus).toBe('pending');
    expect(order?.shippingAddress.city).toBe('New York');
  });

  it('4. POST /api/v1/payments/webhook - Rejects request with missing or invalid signature', async () => {
    const res = await request(app)
      .post('/api/v1/payments/webhook')
      .set('stripe-signature', 't=12345,v1=invalid_fake_signature')
      .send({ id: 'evt_fake_123', type: 'payment_intent.succeeded' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toContain('Invalid webhook signature');
  });

  it('5. POST /api/v1/payments/webhook - Verifies valid signature and updates order paymentStatus to paid', async () => {
    // Create an order first to target
    const orderNumber = `STX-TEST-${Date.now()}`;
    const paymentIntentId = `pi_test_webhook_${Date.now()}`;

    await OrderModel.create({
      sessionId: guestSessionId,
      orderNumber,
      items: [
        {
          productId: sampleProductId,
          product: {
            id: sampleProductId,
            name: 'The Sovereign Tuxedo',
            slug: 'the-sovereign-tuxedo',
            sku: 'SOV-TUX-001',
            basePrice: 1200,
          },
          quantity: 1,
          unitPrice: 1200,
          totalPrice: 1200,
        },
      ],
      shippingAddress: sampleAddress,
      billingAddress: sampleAddress,
      shippingMethod: 'Express Courier',
      subtotal: 1200,
      discount: 0,
      shipping: 0,
      totalAmount: 1200,
      status: 'pending',
      paymentStatus: 'pending',
      paymentIntentId,
      processedWebhookEvents: [],
    });

    const eventPayload = {
      id: 'evt_webhook_success_999',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: paymentIntentId,
          paymentIntentId,
          orderNumber,
          amount: 120000,
          status: 'succeeded',
        },
      },
    };

    const signatureHeader = paymentService.generateTestWebhookSignature(eventPayload);

    const res = await request(app)
      .post('/api/v1/payments/webhook')
      .set('stripe-signature', signatureHeader)
      .send(eventPayload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.idempotent).toBe(false);

    // Verify order status updated to paid in database
    const updatedOrder = await OrderModel.findOne({ orderNumber });
    expect(updatedOrder?.paymentStatus).toBe('paid');
    expect(updatedOrder?.status).toBe('processing');
    expect(updatedOrder?.processedWebhookEvents).toContain('evt_webhook_success_999');
  });

  it('6. POST /api/v1/payments/webhook - Webhook idempotency (processing identical event twice does not double-create or re-process)', async () => {
    const orderNumber = `STX-IDEMPOTENT-${Date.now()}`;
    const paymentIntentId = `pi_test_idempotent_${Date.now()}`;

    await OrderModel.create({
      sessionId: guestSessionId,
      orderNumber,
      items: [],
      shippingAddress: sampleAddress,
      billingAddress: sampleAddress,
      shippingMethod: 'Standard',
      subtotal: 500,
      discount: 0,
      shipping: 0,
      totalAmount: 500,
      status: 'pending',
      paymentStatus: 'pending',
      paymentIntentId,
      processedWebhookEvents: [],
    });

    const duplicateEvent = {
      id: 'evt_duplicate_id_555',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: paymentIntentId,
          orderNumber,
          amount: 50000,
          status: 'succeeded',
        },
      },
    };

    const signatureHeader = paymentService.generateTestWebhookSignature(duplicateEvent);

    // 1st delivery
    const res1 = await request(app)
      .post('/api/v1/payments/webhook')
      .set('stripe-signature', signatureHeader)
      .send(duplicateEvent);

    expect(res1.status).toBe(200);
    expect(res1.body.data.idempotent).toBe(false);

    // 2nd delivery (identical eventId)
    const res2 = await request(app)
      .post('/api/v1/payments/webhook')
      .set('stripe-signature', signatureHeader)
      .send(duplicateEvent);

    expect(res2.status).toBe(200);
    expect(res2.body.data.idempotent).toBe(true); // Confirmed idempotent!

    const order = await OrderModel.findOne({ orderNumber });
    // Event ID is recorded exactly once
    expect(order?.processedWebhookEvents.filter((id) => id === 'evt_duplicate_id_555').length).toBe(1);
  });
});
