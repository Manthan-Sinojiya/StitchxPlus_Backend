import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app.js';
import { generateAccessToken } from '../utils/auth.js';
import { PageModel } from '../models/page.model.js';
import { SiteContentModel } from '../models/siteContent.model.js';

describe('CMS Content Management API Tests', () => {
  let mongoServer: MongoMemoryServer;
  let adminToken: string;
  let customerToken: string;
  let adminId: string;
  let customerId: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    await mongoose.connect(uri);

    adminId = new mongoose.Types.ObjectId().toString();
    customerId = new mongoose.Types.ObjectId().toString();

    adminToken = generateAccessToken({ userId: adminId, role: 'ADMIN' });
    customerToken = generateAccessToken({ userId: customerId, role: 'CUSTOMER' });
  });

  afterAll(async () => {
    await PageModel.deleteMany({});
    await SiteContentModel.deleteMany({});
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe('1. Admin Security & Role Access Enforcement', () => {
    it('rejects unauthenticated requests to admin content endpoints', async () => {
      const res = await request(app).get('/api/v1/admin/content/pages');
      expect(res.status).toBe(401);
    });

    it('rejects non-admin customer accounts with 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/v1/admin/content/pages')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(res.status).toBe(403);
    });

    it('allows authenticated ADMIN users to list pages', async () => {
      const res = await request(app)
        .get('/api/v1/admin/content/pages')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.pages)).toBe(true);
    });
  });

  describe('2. XSS Payload Sanitization on Page Creation', () => {
    it('sanitizes script tags and inline event handlers from rich text body before saving', async () => {
      const xssPayload = {
        title: 'About Atelier',
        slug: 'about-atelier-test',
        body: '<h1>Welcome</h1><script>alert("XSS")</script><p onclick="evil()">Safe text</p><iframe src="malicious.html"></iframe>',
        status: 'published',
      };

      const res = await request(app)
        .post('/api/v1/admin/content/pages')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(xssPayload);

      expect(res.status).toBe(201);
      const createdPage = res.body.data.page;
      expect(createdPage.body).not.toContain('<script>');
      expect(createdPage.body).not.toContain('onclick');
      expect(createdPage.body).not.toContain('<iframe>');
      expect(createdPage.body).toContain('<h1>Welcome</h1>');
      expect(createdPage.body).toContain('Safe text');
    });
  });

  describe('3. Draft vs Published Isolation on Public Endpoints', () => {
    it('does not expose DRAFT status pages on public GET endpoints', async () => {
      // Create a draft page
      await PageModel.create({
        title: 'Secret Upcoming Trunk Show',
        slug: 'secret-event',
        body: '<p>Draft details</p>',
        status: 'draft',
      });

      // Public request should fail with 404
      const res = await request(app).get('/api/v1/pages/secret-event');
      expect(res.status).toBe(404);
    });

    it('returns published pages on public GET /api/v1/pages/:slug', async () => {
      await PageModel.create({
        title: 'Shipping Guidelines',
        slug: 'shipping-rules',
        body: '<p>Global Express Shipping info</p>',
        status: 'published',
      });

      const res = await request(app).get('/api/v1/pages/shipping-rules');
      expect(res.status).toBe(200);
      expect(res.body.data.page.title).toBe('Shipping Guidelines');
    });
  });

  describe('4. Site Content Block CRUD & Public Endpoints', () => {
    it('allows admin to update homepage hero block and reflects on public GET /api/v1/content/home', async () => {
      const updatedHero = {
        hero: {
          headline: 'Winter Bespoke Collection 2026',
          subtext: 'Handcrafted cashmere overcoats and Super 150s tuxedos.',
          image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35',
          ctaText: 'Explore Winter Trunk Show',
          ctaLink: '/collections',
        },
      };

      const adminRes = await request(app)
        .put('/api/v1/admin/content/blocks/home')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ data: updatedHero, status: 'published' });

      expect(adminRes.status).toBe(200);

      // Verify public home endpoint returns the updated hero headline
      const publicRes = await request(app).get('/api/v1/content/home');
      expect(publicRes.status).toBe(200);
      expect(publicRes.body.data.content.hero.headline).toBe('Winter Bespoke Collection 2026');
    });
  });
});
