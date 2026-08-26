import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app.js';
import { CategoryModel } from '../models/category.model.js';
import { FabricModel } from '../models/fabric.model.js';
import { ProductModel } from '../models/product.model.js';
import { UserModel } from '../models/user.model.js';
import { generateAccessToken } from '../utils/auth.js';

let mongoServer: MongoMemoryServer;
let adminToken: string;
let customerToken: string;
let categoryId: string;
let fabricId: string;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Setup Admin user & Customer user
  const admin = await UserModel.create({
    name: 'Admin User',
    email: 'admin@stitchx.com',
    password: 'Password123!',
    role: 'ADMIN',
    isVerified: true,
  });
  adminToken = generateAccessToken({
    userId: admin._id.toString(),
    role: admin.role,
  });

  const customer = await UserModel.create({
    name: 'Customer User',
    email: 'customer@stitchx.com',
    password: 'Password123!',
    role: 'CUSTOMER',
    isVerified: true,
  });
  customerToken = generateAccessToken({
    userId: customer._id.toString(),
    role: customer.role,
  });
}, 30000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  await CategoryModel.deleteMany({});
  await FabricModel.deleteMany({});
  await ProductModel.deleteMany({});

  // Seed sample category and fabric
  const cat = await CategoryModel.create({
    name: 'Custom Suits',
    slug: 'custom-suits',
    description: 'Bespoke two-piece suits',
    isActive: true,
  });
  categoryId = cat._id.toString();

  const fab = await FabricModel.create({
    name: 'Super 130s Wool',
    code: 'VBC-130',
    composition: '100% Wool',
    priceMultiplier: 1.0,
  });
  fabricId = fab._id.toString();

  // Seed 3 products
  await ProductModel.create([
    {
      name: 'Milano Navy Suit',
      slug: 'milano-navy-suit',
      sku: 'SUIT-001',
      category: categoryId,
      description: 'Hand-tailored luxury Italian wool navy suit',
      basePrice: 950,
      images: ['https://example.com/navy-suit.jpg'],
      availableFabrics: [fabricId],
      colors: ['navy', 'blue'],
      tags: ['suit', 'bespoke', 'navy'],
      inStock: true,
      rating: 4.9,
      numReviews: 10,
    },
    {
      name: 'Savoy Charcoal Tuxedo',
      slug: 'savoy-charcoal-tuxedo',
      sku: 'TUX-002',
      category: categoryId,
      description: 'Formal black-tie dinner suit with satin lapels',
      basePrice: 1250,
      images: ['https://example.com/charcoal-tux.jpg'],
      availableFabrics: [fabricId],
      colors: ['charcoal', 'black'],
      tags: ['tuxedo', 'black-tie'],
      inStock: true,
      rating: 5.0,
      numReviews: 5,
    },
    {
      name: 'Oxford Casual Blazer',
      slug: 'oxford-casual-blazer',
      sku: 'BLZ-003',
      category: categoryId,
      description: 'Casual unlined tweed blazer',
      basePrice: 450,
      images: ['https://example.com/blazer.jpg'],
      availableFabrics: [fabricId],
      colors: ['brown', 'grey'],
      tags: ['blazer', 'casual'],
      inStock: true,
      rating: 4.5,
      numReviews: 3,
    },
  ]);
});

describe('Category API', () => {
  it('GET /api/v1/categories - lists active categories', async () => {
    const res = await request(app).get('/api/v1/categories');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].slug).toBe('custom-suits');
  });

  it('GET /api/v1/categories/:slug - returns single category', async () => {
    const res = await request(app).get('/api/v1/categories/custom-suits');
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Custom Suits');
  });

  it('POST /api/v1/categories - admin can create category', async () => {
    const res = await request(app)
      .post('/api/v1/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Tuxedos & Formal',
        slug: 'tuxedos-formal',
        description: 'Black tie collection',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.slug).toBe('tuxedos-formal');
  });

  it('POST /api/v1/categories - customer is forbidden (403)', async () => {
    const res = await request(app)
      .post('/api/v1/categories')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ name: 'Forbidden Category' });

    expect(res.status).toBe(403);
  });
});

describe('Product API', () => {
  it('GET /api/v1/products - retrieves paginated products list', async () => {
    const res = await request(app).get('/api/v1/products?page=1&limit=2');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.products.length).toBe(2);
    expect(res.body.data.pagination.total).toBe(3);
    expect(res.body.data.pagination.totalPages).toBe(2);
  });

  it('GET /api/v1/products - filters by category slug', async () => {
    const res = await request(app).get('/api/v1/products?category=custom-suits');
    expect(res.status).toBe(200);
    expect(res.body.data.products.length).toBe(3);
  });

  it('GET /api/v1/products - filters by price range and color', async () => {
    const res = await request(app).get('/api/v1/products?priceMin=400&priceMax=1000&color=navy');
    expect(res.status).toBe(200);
    expect(res.body.data.products.length).toBe(1);
    expect(res.body.data.products[0].slug).toBe('milano-navy-suit');
  });

  it('GET /api/v1/products - sorts by price ascending', async () => {
    const res = await request(app).get('/api/v1/products?sort=price_asc');
    expect(res.status).toBe(200);
    const prices = res.body.data.products.map((p: any) => p.basePrice);
    expect(prices).toEqual([450, 950, 1250]);
  });

  it('GET /api/v1/products - performs search by term', async () => {
    const res = await request(app).get('/api/v1/products?search=tuxedo');
    expect(res.status).toBe(200);
    expect(res.body.data.products.length).toBe(1);
    expect(res.body.data.products[0].slug).toBe('savoy-charcoal-tuxedo');
  });

  it('GET /api/v1/products/:slug - retrieves product details with populated category', async () => {
    const res = await request(app).get('/api/v1/products/milano-navy-suit');
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Milano Navy Suit');
    expect(res.body.data.category.name).toBe('Custom Suits');
  });

  it('GET /api/v1/products/:id/related - retrieves related products by category or fabric', async () => {
    const product = await ProductModel.findOne({ slug: 'milano-navy-suit' });
    const res = await request(app).get(`/api/v1/products/${product!._id}/related`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    // Should return the other products sharing the category/fabric and exclude the target product itself
    expect(res.body.data.length).toBeGreaterThan(0);
    const relatedIds = res.body.data.map((p: any) => p.id || p._id);
    expect(relatedIds).not.toContain(product!._id.toString());
  });

  it('GET /api/v1/products/:id/related - returns 404 for non-existent product', async () => {
    const res = await request(app).get('/api/v1/products/non-existent-product-id/related');
    expect(res.status).toBe(404);
  });

  it('POST /api/v1/products - admin creates new product', async () => {
    const res = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'New Velvet Jacket',
        category: categoryId,
        description: 'Luxury velvet jacket',
        basePrice: 650,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('New Velvet Jacket');
  });

  it('PATCH /api/v1/products/:id - admin updates product', async () => {
    const product = await ProductModel.findOne({ slug: 'milano-navy-suit' });
    const res = await request(app)
      .patch(`/api/v1/products/${product!._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ basePrice: 990 });

    expect(res.status).toBe(200);
    expect(res.body.data.basePrice).toBe(990);
  });

  it('DELETE /api/v1/products/:id - admin deletes product', async () => {
    const product = await ProductModel.findOne({ slug: 'oxford-casual-blazer' });
    const res = await request(app)
      .delete(`/api/v1/products/${product!._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);

    const check = await ProductModel.findById(product!._id);
    expect(check).toBeNull();
  });
});
