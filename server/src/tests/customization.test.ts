import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app.js';
import { CustomizationService } from '../services/customization.service.js';

let mongoServer: MongoMemoryServer;
let customizationService: CustomizationService;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  customizationService = new CustomizationService();

  // Seed default options
  const repo = (customizationService as any).customizationRepository;
  await repo.seedDefaultOptionsIfEmpty();
}, 30000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Customization Backend Engine Unit & Integration Tests', () => {
  describe('Unit Tests: Price Calculation Logic', () => {
    it('calculates correct total price for base configuration with zero adjustments', async () => {
      const selectedOptions = {
        fabric: 'fabric-super130', // +0
        jacketStyle: 'jacket-single-2b', // +0
        lapel: 'lapel-notch', // +0
        buttons: 'btn-horn', // +0
        pockets: 'pocket-flap', // +0
        vents: 'vent-double', // +0
        lining: 'lining-navy-cupro', // +0
        trousers: 'trouser-flat-front', // +0
      };

      const result = await customizationService.calculatePrice(undefined, selectedOptions, 899);
      expect(result.basePrice).toBe(899);
      expect(result.totalAdjustments).toBe(0);
      expect(result.totalPrice).toBe(899);
      expect(result.optionAdjustments).toHaveLength(8);
    });

    it('calculates authoritative total price combining multiple premium adjustments', async () => {
      const selectedOptions = {
        fabric: 'fabric-super150', // +120
        jacketStyle: 'jacket-double-6b', // +50
        lapel: 'lapel-peak', // +30
        buttons: 'btn-mop', // +25
        pockets: 'pocket-patch', // +15
        vents: 'vent-double', // +0
        lining: 'lining-gold-paisley', // +45
        trousers: 'trouser-side-adjusters', // +25
      };
      // Total adjustments = 120 + 50 + 30 + 25 + 15 + 0 + 45 + 25 = 310

      const result = await customizationService.calculatePrice(undefined, selectedOptions, 1000);
      expect(result.basePrice).toBe(1000);
      expect(result.totalAdjustments).toBe(310);
      expect(result.totalPrice).toBe(1310);
    });
  });

  describe('Integration Tests: /api/v1/customizations Endpoints', () => {
    it('POST /api/v1/customizations/price calculates price from HTTP request', async () => {
      const res = await request(app)
        .post('/api/v1/customizations/price')
        .send({
          basePrice: 899,
          selectedOptions: {
            fabric: 'fabric-super150', // +120
            lapel: 'lapel-peak', // +30
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalPrice).toBe(899 + 120 + 30);
    });

    it('POST /api/v1/customizations/validate accepts valid 8-step configuration', async () => {
      const res = await request(app)
        .post('/api/v1/customizations/validate')
        .send({
          selectedOptions: {
            fabric: 'fabric-super130',
            jacketStyle: 'jacket-single-2b',
            lapel: 'lapel-notch',
            buttons: 'btn-horn',
            pockets: 'pocket-flap',
            vents: 'vent-double',
            lining: 'lining-navy-cupro',
            trousers: 'trouser-flat-front',
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.valid).toBe(true);
      expect(res.body.data.errors).toHaveLength(0);
    });

    it('POST /api/v1/customizations/validate rejects missing required option group', async () => {
      const res = await request(app)
        .post('/api/v1/customizations/validate')
        .send({
          selectedOptions: {
            fabric: 'fabric-super130',
            // Missing jacketStyle, lapel, etc.
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.valid).toBe(false);
      expect(res.body.data.errors.length).toBeGreaterThan(0);
    });

    it('POST /api/v1/customizations/validate rejects incompatible combinations (Satin Shawl Collar with Double Breasted)', async () => {
      const res = await request(app)
        .post('/api/v1/customizations/validate')
        .send({
          selectedOptions: {
            fabric: 'fabric-super130',
            jacketStyle: 'jacket-double-6b', // Double Breasted
            lapel: 'lapel-shawl', // Shawl Collar (Incompatible with Double Breasted)
            buttons: 'btn-horn',
            pockets: 'pocket-flap',
            vents: 'vent-double',
            lining: 'lining-navy-cupro',
            trousers: 'trouser-flat-front',
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.valid).toBe(false);
      expect(res.body.data.errors).toContain(
        "'Satin Shawl Collar' is incompatible with 'Double Breasted (6 Button)'",
      );
    });
  });
});
