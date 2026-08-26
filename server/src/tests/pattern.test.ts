import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app.js';
import { generateAccessToken } from '../utils/auth.js';
import { UserModel } from '../models/user.model.js';

let mongoServer: MongoMemoryServer;
let userAToken: string;
let userBToken: string;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const userA = await UserModel.create({
    name: 'User A',
    email: 'usera@example.com',
    passwordHash: 'hashedpassword123',
    role: 'CUSTOMER',
  });
  userAToken = generateAccessToken({ userId: userA.id, role: 'CUSTOMER' });

  const userB = await UserModel.create({
    name: 'User B',
    email: 'userb@example.com',
    passwordHash: 'hashedpassword123',
    role: 'CUSTOMER',
  });
  userBToken = generateAccessToken({ userId: userB.id, role: 'CUSTOMER' });
}, 30000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Measurement Profile ("Pattern") API Tests', () => {
  let createdPatternId: string;

  const validSamplePattern = {
    name: 'Wedding Fit',
    height: 72,
    chest: 40,
    waist: 34,
    shoulder: 18.5,
    sleeve: 34.5,
    neck: 15.5,
    jacketLength: 30,
    trouserWaist: 34,
    inseam: 32,
    thigh: 24,
    fitPreference: 'slim',
    unit: 'inches',
  };

  it('1. POST /api/v1/patterns - Creates a new pattern profile successfully', async () => {
    const res = await request(app)
      .post('/api/v1/patterns')
      .set('Authorization', `Bearer ${userAToken}`)
      .send(validSamplePattern);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Wedding Fit');
    expect(res.body.data.chest).toBe(40);
    expect(res.body.data.isDefault).toBe(true); // First pattern is default

    createdPatternId = res.body.data.id;
  });

  it('2. GET /api/v1/patterns - Lists all patterns for the logged-in user', async () => {
    const res = await request(app)
      .get('/api/v1/patterns')
      .set('Authorization', `Bearer ${userAToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].id).toBe(createdPatternId);
  });

  it('3. GET /api/v1/patterns/:id - Retrieves a specific pattern by ID', async () => {
    const res = await request(app)
      .get(`/api/v1/patterns/${createdPatternId}`)
      .set('Authorization', `Bearer ${userAToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Wedding Fit');
  });

  it('4. PUT /api/v1/patterns/:id - Updates (renames and adjusts) pattern profile', async () => {
    const res = await request(app)
      .put(`/api/v1/patterns/${createdPatternId}`)
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        name: 'Groom Wedding Fit',
        chest: 41,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Groom Wedding Fit');
    expect(res.body.data.chest).toBe(41);
  });

  it('5. POST /api/v1/patterns/:id/duplicate - Duplicates a pattern profile with "Copy of" prefix', async () => {
    const res = await request(app)
      .post(`/api/v1/patterns/${createdPatternId}/duplicate`)
      .set('Authorization', `Bearer ${userAToken}`);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Copy of Groom Wedding Fit');
    expect(res.body.data.chest).toBe(41);
    expect(res.body.data.id).not.toBe(createdPatternId);
  });

  it('6. PATCH /api/v1/patterns/:id/default - Sets pattern as default profile', async () => {
    // Create a second pattern
    const secondRes = await request(app)
      .post('/api/v1/patterns')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        ...validSamplePattern,
        name: 'Business Daily',
      });
    const secondId = secondRes.body.data.id;

    // Set second pattern as default
    const setDefRes = await request(app)
      .patch(`/api/v1/patterns/${secondId}/default`)
      .set('Authorization', `Bearer ${userAToken}`);

    expect(setDefRes.status).toBe(200);
    expect(setDefRes.body.data.isDefault).toBe(true);

    // Verify first pattern is no longer default
    const firstCheck = await request(app)
      .get(`/api/v1/patterns/${createdPatternId}`)
      .set('Authorization', `Bearer ${userAToken}`);
    expect(firstCheck.body.data.isDefault).toBe(false);
  });

  it('7. Security Check - Prevents User B from accessing or editing User A pattern', async () => {
    const getRes = await request(app)
      .get(`/api/v1/patterns/${createdPatternId}`)
      .set('Authorization', `Bearer ${userBToken}`);

    expect(getRes.status).toBe(404);

    const updateRes = await request(app)
      .put(`/api/v1/patterns/${createdPatternId}`)
      .set('Authorization', `Bearer ${userBToken}`)
      .send({ name: 'Hacked Name' });

    expect(updateRes.status).toBe(404);
  });

  it('8. DELETE /api/v1/patterns/:id - Deletes a measurement profile', async () => {
    const delRes = await request(app)
      .delete(`/api/v1/patterns/${createdPatternId}`)
      .set('Authorization', `Bearer ${userAToken}`);

    expect(delRes.status).toBe(200);

    const getRes = await request(app)
      .get(`/api/v1/patterns/${createdPatternId}`)
      .set('Authorization', `Bearer ${userAToken}`);

    expect(getRes.status).toBe(404);
  });
});
