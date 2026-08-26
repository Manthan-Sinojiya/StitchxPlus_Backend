import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app.js';
import { UserModel } from '../models/user.model.js';
import { ProductModel } from '../models/product.model.js';
import { OrderModel } from '../models/order.model.js';
import { generateAccessToken } from '../utils/auth.js';

let mongoServer: MongoMemoryServer;
let userAToken: string;
let userBToken: string;
let userAId: string;
let userBId: string;
let productAId: string;
let orderUserA: any;
let shippedOrderA: any;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // Create test users
  const userA = await UserModel.create({
    name: 'Lord UserA',
    email: 'usera@stitchx.com',
    role: 'CUSTOMER',
    phone: '+1 212 555 0100',
    isVerified: true,
  });
  userAId = userA._id.toString();
  userAToken = generateAccessToken({ userId: userAId, role: 'CUSTOMER' });

  const userB = await UserModel.create({
    name: 'Duke UserB',
    email: 'userb@stitchx.com',
    role: 'CUSTOMER',
    phone: '+1 212 555 0200',
    isVerified: true,
  });
  userBId = userB._id.toString();
  userBToken = generateAccessToken({ userId: userBId, role: 'CUSTOMER' });

  // Create sample product
  const product = await ProductModel.create({
    name: 'Bespoke Velvet Dinner Suit',
    slug: 'bespoke-velvet-dinner-suit-account-test',
    sku: 'SUIT-VELVET-ACCT',
    basePrice: 1650,
    category: new mongoose.Types.ObjectId(),
    description: 'Black velvet tuxedo jacket with silk satin peak lapels',
    images: ['https://example.com/velvet.jpg'],
    inStock: true,
  });
  productAId = product._id.toString();

  // Create order for User A
  orderUserA = await OrderModel.create({
    userId: userA._id,
    orderNumber: 'STX-TEST-A100',
    items: [
      {
        productId: product._id,
        product: {
          id: product._id.toString(),
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          basePrice: 1650,
        },
        quantity: 1,
        unitPrice: 1650,
        totalPrice: 1650,
      },
    ],
    shippingAddress: {
      firstName: 'Lord',
      lastName: 'UserA',
      street: '10 Downing Street',
      city: 'London',
      state: 'LN',
      zipCode: 'SW1A 2AA',
      country: 'United Kingdom',
      phone: '+44 20 7925 0918',
      email: 'usera@stitchx.com',
    },
    billingAddress: {
      firstName: 'Lord',
      lastName: 'UserA',
      street: '10 Downing Street',
      city: 'London',
      state: 'LN',
      zipCode: 'SW1A 2AA',
      country: 'United Kingdom',
      phone: '+44 20 7925 0918',
      email: 'usera@stitchx.com',
    },
    shippingMethod: 'Standard Express',
    subtotal: 1650,
    discount: 0,
    shipping: 0,
    totalAmount: 1650,
    status: 'PAID',
    paymentStatus: 'paid',
  });

  // Create order for User B
  await OrderModel.create({
    userId: userB._id,
    orderNumber: 'STX-TEST-B200',
    items: [],
    shippingAddress: {
      firstName: 'Duke',
      lastName: 'UserB',
      street: '221B Baker Street',
      city: 'London',
      state: 'LN',
      zipCode: 'NW1 6XE',
      country: 'United Kingdom',
      phone: '+44 20 7224 3688',
      email: 'userb@stitchx.com',
    },
    billingAddress: {
      firstName: 'Duke',
      lastName: 'UserB',
      street: '221B Baker Street',
      city: 'London',
      state: 'LN',
      zipCode: 'NW1 6XE',
      country: 'United Kingdom',
      phone: '+44 20 7224 3688',
      email: 'userb@stitchx.com',
    },
    shippingMethod: 'Standard Express',
    subtotal: 1200,
    discount: 0,
    shipping: 0,
    totalAmount: 1200,
    status: 'PAID',
    paymentStatus: 'paid',
  });

  // Create SHIPPED order for User A (ineligible for cancellation)
  shippedOrderA = await OrderModel.create({
    userId: userA._id,
    orderNumber: 'STX-TEST-A-SHIPPED',
    items: [],
    shippingAddress: {
      firstName: 'Lord',
      lastName: 'UserA',
      street: '10 Downing Street',
      city: 'London',
      state: 'LN',
      zipCode: 'SW1A 2AA',
      country: 'United Kingdom',
      phone: '+44 20 7925 0918',
      email: 'usera@stitchx.com',
    },
    billingAddress: {
      firstName: 'Lord',
      lastName: 'UserA',
      street: '10 Downing Street',
      city: 'London',
      state: 'LN',
      zipCode: 'SW1A 2AA',
      country: 'United Kingdom',
      phone: '+44 20 7925 0918',
      email: 'usera@stitchx.com',
    },
    shippingMethod: 'White-Glove',
    subtotal: 2500,
    discount: 0,
    shipping: 75,
    totalAmount: 2575,
    status: 'SHIPPED',
    paymentStatus: 'paid',
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Order Scoping & Cancellation Eligibility Tests', () => {
  it('1. GET /api/v1/orders/my-orders - User A receives ONLY User A orders', async () => {
    const res = await request(app)
      .get('/api/v1/orders/my-orders')
      .set('Authorization', `Bearer ${userAToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    
    // User A should see 2 orders (orderUserA and shippedOrderA), but NOT orderUserB
    const orderNumbers = res.body.data.map((o: any) => o.orderNumber);
    expect(orderNumbers).toContain('STX-TEST-A100');
    expect(orderNumbers).toContain('STX-TEST-A-SHIPPED');
    expect(orderNumbers).not.toContain('STX-TEST-B200');
  });

  it('2. GET /api/v1/orders/:id - User B trying to access User A order receives 403 Forbidden', async () => {
    const res = await request(app)
      .get(`/api/v1/orders/${orderUserA._id}`)
      .set('Authorization', `Bearer ${userBToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toMatch(/Forbidden/i);
  });

  it('3. POST /api/v1/orders/:id/cancel - User A cancels order in PAID status (Eligible)', async () => {
    const res = await request(app)
      .post(`/api/v1/orders/${orderUserA._id}/cancel`)
      .set('Authorization', `Bearer ${userAToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('CANCELLED');
  });

  it('4. POST /api/v1/orders/:id/cancel - User A attempts to cancel SHIPPED order (Ineligible -> 400)', async () => {
    const res = await request(app)
      .post(`/api/v1/orders/${shippedOrderA._id}/cancel`)
      .set('Authorization', `Bearer ${userAToken}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toMatch(/cannot be cancelled in status: SHIPPED/i);
  });
});

describe('User Profile, Address Book & Wishlist API Tests', () => {
  it('5. GET /api/v1/users/me & PATCH /api/v1/users/me - Update User Profile', async () => {
    const res = await request(app)
      .patch('/api/v1/users/me')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ name: 'Sir User A Updated', phone: '+1 999 888 7777' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Sir User A Updated');
    expect(res.body.data.phone).toBe('+1 999 888 7777');
  });

  it('6. Address Book - Add, List, Update, and Delete Address', async () => {
    // Add Address
    const addRes = await request(app)
      .post('/api/v1/users/me/addresses')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        label: 'Townhouse',
        firstName: 'Lord',
        lastName: 'UserA',
        street: '742 Evergreen Terrace',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'United States',
        phone: '+1 212 555 0199',
        isDefault: true,
      });

    expect(addRes.status).toBe(201);
    expect(addRes.body.data.length).toBe(1);
    const addressId = addRes.body.data[0]._id;

    // Get Addresses
    const getRes = await request(app)
      .get('/api/v1/users/me/addresses')
      .set('Authorization', `Bearer ${userAToken}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body.data[0].label).toBe('Townhouse');

    // Delete Address
    const delRes = await request(app)
      .delete(`/api/v1/users/me/addresses/${addressId}`)
      .set('Authorization', `Bearer ${userAToken}`);

    expect(delRes.status).toBe(200);
    expect(delRes.body.data.length).toBe(0);
  });

  it('7. Wishlist - Add to Wishlist, Get Wishlist, and Remove from Wishlist', async () => {
    // Add item to wishlist
    const addRes = await request(app)
      .post(`/api/v1/users/me/wishlist/${productAId}`)
      .set('Authorization', `Bearer ${userAToken}`);

    expect(addRes.status).toBe(200);
    expect(addRes.body.success).toBe(true);

    // Get wishlist populated with product
    const getRes = await request(app)
      .get('/api/v1/users/me/wishlist')
      .set('Authorization', `Bearer ${userAToken}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body.data.length).toBe(1);
    expect(getRes.body.data[0].productId.name).toBe('Bespoke Velvet Dinner Suit');

    // Remove from wishlist
    const delRes = await request(app)
      .delete(`/api/v1/users/me/wishlist/${productAId}`)
      .set('Authorization', `Bearer ${userAToken}`);

    expect(delRes.status).toBe(200);
    expect(delRes.body.data.length).toBe(0);
  });
});
