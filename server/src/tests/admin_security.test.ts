import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import { generateAccessToken } from '../utils/auth.js';
import { UserModel, OrderModel, AuditLogModel } from '../models/index.js';

describe('Admin API Role Security & Audit Trail Tests', () => {
  let customerToken: string;
  let adminToken: string;
  let staffToken: string;
  let customerId: string;
  let adminId: string;
  let testOrderId: string;

  beforeAll(async () => {
    // Ensure Mongoose connection is ready
    if (mongoose.connection.readyState === 0) {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/stitchx_test';
      await mongoose.connect(mongoUri);
    }

    // Clean up test data
    await UserModel.deleteMany({ email: { $in: ['testcustomer_admin@example.com', 'admin_sec@example.com', 'staff_sec@example.com'] } });
    await OrderModel.deleteMany({ orderNumber: /^STX-ADMIN-SEC/ });
    await AuditLogModel.deleteMany({ userEmail: 'admin_sec@example.com' });

    // 1. Create CUSTOMER user & token
    const customer = await UserModel.create({
      name: 'Regular Customer',
      email: 'testcustomer_admin@example.com',
      password: 'Password123!',
      role: 'CUSTOMER',
    });
    customerId = customer._id.toString();
    customerToken = generateAccessToken({ userId: customerId, role: 'CUSTOMER' });

    // 2. Create ADMIN user & token
    const admin = await UserModel.create({
      name: 'Super Admin',
      email: 'admin_sec@example.com',
      password: 'Password123!',
      role: 'ADMIN',
    });
    adminId = admin._id.toString();
    adminToken = generateAccessToken({ userId: adminId, role: 'ADMIN' });

    // 3. Create STAFF user & token
    const staff = await UserModel.create({
      name: 'Workshop Staff',
      email: 'staff_sec@example.com',
      password: 'Password123!',
      role: 'STAFF',
    });
    staffToken = generateAccessToken({ userId: staff._id.toString(), role: 'STAFF' });

    // 4. Create sample order for status update tests
    const order = await OrderModel.create({
      userId: customerId,
      orderNumber: `STX-ADMIN-SEC-${Date.now()}`,
      items: [
        {
          productId: new mongoose.Types.ObjectId(),
          product: {
            id: 'p1',
            name: 'Milano Navy Suit',
            slug: 'milano-navy-suit',
            sku: 'SUIT-NAVY-01',
            basePrice: 950,
          },
          quantity: 1,
          unitPrice: 950,
          totalPrice: 950,
        },
      ],
      shippingAddress: {
        firstName: 'Regular',
        lastName: 'Customer',
        street: '123 Fashion Ave',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
        phone: '555-0199',
        email: 'testcustomer_admin@example.com',
      },
      billingAddress: {
        firstName: 'Regular',
        lastName: 'Customer',
        street: '123 Fashion Ave',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
        phone: '555-0199',
        email: 'testcustomer_admin@example.com',
      },
      shippingMethod: 'Standard Express',
      subtotal: 950,
      discount: 0,
      shipping: 0,
      totalAmount: 950,
      status: 'PAID',
      paymentStatus: 'paid',
    });
    testOrderId = order._id.toString();
  });

  afterAll(async () => {
    await UserModel.deleteMany({ email: { $in: ['testcustomer_admin@example.com', 'admin_sec@example.com', 'staff_sec@example.com'] } });
    await OrderModel.deleteMany({ orderNumber: /^STX-ADMIN-SEC/ });
    await AuditLogModel.deleteMany({ userEmail: 'admin_sec@example.com' });
    await mongoose.connection.close();
  });

  describe('Unauthenticated & Customer Access Security (401 & 403 Forbidden)', () => {
    it('1. Unauthenticated request to /api/v1/admin/stats returns 401 Unauthorized', async () => {
      const res = await request(app).get('/api/v1/admin/stats');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('2. CUSTOMER user attempting GET /api/v1/admin/stats returns 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/v1/admin/stats')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('3. CUSTOMER user attempting GET /api/v1/admin/orders returns 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/v1/admin/orders')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(res.status).toBe(403);
    });

    it('4. CUSTOMER user attempting PATCH /api/v1/admin/orders/:id/status returns 403 Forbidden', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/orders/${testOrderId}/status`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ status: 'PROCESSING' });
      expect(res.status).toBe(403);
    });

    it('5. CUSTOMER user attempting GET /api/v1/admin/customers returns 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/v1/admin/customers')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(res.status).toBe(403);
    });

    it('6. CUSTOMER user attempting POST /api/v1/admin/customizations returns 403 Forbidden', async () => {
      const res = await request(app)
        .post('/api/v1/admin/customizations')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ group: 'Lapel', groupCode: 'lapel' });
      expect(res.status).toBe(403);
    });

    it('7. CUSTOMER user attempting POST /api/v1/admin/coupons returns 403 Forbidden', async () => {
      const res = await request(app)
        .post('/api/v1/admin/coupons')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ code: 'HACK20', discountType: 'percentage', discountValue: 20 });
      expect(res.status).toBe(403);
    });

    it('8. CUSTOMER user attempting GET /api/v1/admin/audit-logs returns 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/v1/admin/audit-logs')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(res.status).toBe(403);
    });
  });

  describe('Admin Authorized Endpoints & Audit Logging', () => {
    it('9. ADMIN user GET /api/v1/admin/stats returns 200 OK with metrics', async () => {
      const res = await request(app)
        .get('/api/v1/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('totalRevenue');
      expect(res.body.data).toHaveProperty('totalOrders');
      expect(res.body.data).toHaveProperty('recentOrders');
    });

    it('10. ADMIN user PATCH /api/v1/admin/orders/:id/status updates status and writes Audit Log', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/orders/${testOrderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'IN_PRODUCTION', trackingNumber: 'TRK-998877' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('IN_PRODUCTION');
      expect(res.body.data.trackingNumber).toBe('TRK-998877');

      // Verify AuditLog entry was created
      const auditLog = await AuditLogModel.findOne({ entityId: testOrderId, action: 'ORDER_STATUS_UPDATE' });
      expect(auditLog).not.toBeNull();
      expect(auditLog?.userName).toBe('Super Admin');
    });

    it('11. STAFF user GET /api/v1/admin/orders succeeds (200 OK)', async () => {
      const res = await request(app)
        .get('/api/v1/admin/orders')
        .set('Authorization', `Bearer ${staffToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
