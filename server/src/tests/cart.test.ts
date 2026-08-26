import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app.js';
import { generateAccessToken } from '../utils/auth.js';
import { UserModel } from '../models/user.model.js';
import { ProductModel } from '../models/product.model.js';
import { CouponModel } from '../models/coupon.model.js';

let mongoServer: MongoMemoryServer;
let userToken: string;
let sampleProductId: string;
const guestSessionId = 'guest_session_test_123';

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  // Seed sample user
  const user = await UserModel.create({
    name: 'Cart Tester',
    email: 'carttester@example.com',
    passwordHash: 'hashedpassword123',
    role: 'CUSTOMER',
  });
  userToken = generateAccessToken({ userId: user.id, role: 'CUSTOMER' });

  // Seed sample product
  const product = await ProductModel.create({
    name: 'The Tuxedo Suit',
    slug: 'the-tuxedo-suit',
    description: 'Black tie luxury tuxedo',
    basePrice: 950,
    price: 950,
    images: ['https://example.com/tuxedo.jpg'],
    sku: 'TUX-001',
    category: new mongoose.Types.ObjectId(),
    isActive: true,
  });
  sampleProductId = product.id;

  // Seed sample coupons
  await CouponModel.create([
    {
      code: 'WELCOME10',
      discountType: 'percentage',
      discountValue: 10,
      minOrderValue: 500,
      isActive: true,
    },
    {
      code: 'EXPIRED20',
      discountType: 'percentage',
      discountValue: 20,
      minOrderValue: 100,
      expiresAt: new Date(Date.now() - 86400000), // Expired yesterday
      isActive: true,
    },
    {
      code: 'HIGHMIN',
      discountType: 'fixed',
      discountValue: 100,
      minOrderValue: 2000,
      isActive: true,
    },
  ]);
}, 30000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Shopping Cart API & Coupon Validation Tests', () => {
  let guestItemId: string;

  it('1. POST /api/v1/cart/items - Guest adds item to cart with customization and measurements', async () => {
    const res = await request(app)
      .post('/api/v1/cart/items')
      .set('X-Session-ID', guestSessionId)
      .send({
        productId: sampleProductId,
        quantity: 1,
        customization: {
          selectedOptions: { lapel: 'peak', buttons: '2-button' },
          basePrice: 950,
          totalPrice: 950,
        },
        measurementProfile: {
          name: 'Wedding Measurements',
          chest: 42,
          waist: 34,
          inseam: 32,
        },
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items.length).toBe(1);
    expect(res.body.data.subtotal).toBe(950);
    expect(res.body.data.items[0].measurementProfile.chest).toBe(42);

    guestItemId = res.body.data.items[0].id;
  });

  it('2. PATCH /api/v1/cart/items/:id - Guest updates item quantity', async () => {
    const res = await request(app)
      .patch(`/api/v1/cart/items/${guestItemId}`)
      .set('X-Session-ID', guestSessionId)
      .send({ quantity: 2 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items[0].quantity).toBe(2);
    expect(res.body.data.subtotal).toBe(1900); // 950 * 2
  });

  it('3. POST /api/v1/cart/coupon - Validates & applies percentage coupon code', async () => {
    const res = await request(app)
      .post('/api/v1/cart/coupon')
      .set('X-Session-ID', guestSessionId)
      .send({ code: 'WELCOME10' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.couponCode).toBe('WELCOME10');
    expect(res.body.data.discount).toBe(190); // 10% of 1900
    expect(res.body.data.total).toBe(1710); // 1900 - 190
  });

  it('4. POST /api/v1/cart/coupon - Rejects expired coupon code', async () => {
    const res = await request(app)
      .post('/api/v1/cart/coupon')
      .set('X-Session-ID', guestSessionId)
      .send({ code: 'EXPIRED20' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toContain('expired');
  });

  it('5. POST /api/v1/cart/coupon - Rejects coupon when subtotal < minOrderValue', async () => {
    const res = await request(app)
      .post('/api/v1/cart/coupon')
      .set('X-Session-ID', guestSessionId)
      .send({ code: 'HIGHMIN' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toContain('at least $2000');
  });

  it('6. POST /api/v1/cart/merge - Merges guest cart into authenticated user cart on login', async () => {
    // 1. Add item to user cart first
    await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        productId: sampleProductId,
        quantity: 1,
        customization: { selectedOptions: { lapel: 'peak', buttons: '2-button' } },
        measurementProfile: { name: 'Wedding Measurements', chest: 42, waist: 34, inseam: 32 },
      });

    // 2. Perform merge
    const mergeRes = await request(app)
      .post('/api/v1/cart/merge')
      .set('Authorization', `Bearer ${userToken}`)
      .set('X-Session-ID', guestSessionId);

    expect(mergeRes.status).toBe(200);
    expect(mergeRes.body.success).toBe(true);
    // Quantities for identical items should combine: 2 (from guest) + 1 (user) = 3
    expect(mergeRes.body.data.items[0].quantity).toBe(3);
    expect(mergeRes.body.data.couponCode).toBe('WELCOME10');
  });

  it('7. DELETE /api/v1/cart/items/:id - Removes item from cart', async () => {
    const getCartRes = await request(app)
      .get('/api/v1/cart')
      .set('Authorization', `Bearer ${userToken}`);

    const itemId = getCartRes.body.data.items[0].id;

    const delRes = await request(app)
      .delete(`/api/v1/cart/items/${itemId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(delRes.status).toBe(200);
    expect(delRes.body.success).toBe(true);
    expect(delRes.body.data.items.length).toBe(0);
    expect(delRes.body.data.subtotal).toBe(0);
  });
});
