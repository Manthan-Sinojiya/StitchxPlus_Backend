import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app.js';
import { UserModel } from '../models/user.model.js';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await UserModel.deleteMany({});
});

describe('Authentication API Endpoints', () => {
  const sampleUser = {
    name: 'Lord Henry',
    email: 'henry@stitchx.com',
    password: 'Password123!',
    role: 'CUSTOMER',
  };

  it('1. POST /api/v1/auth/register - Registers a new user successfully', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(sampleUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(sampleUser.email);
    expect(res.body.data.user.password).toBeUndefined(); // Ensure password is NEVER returned
    expect(res.body.data.accessToken).toBeDefined();

    // Verify HTTP-only refresh token cookie set
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toContain('refreshToken=');
    expect(cookies[0]).toContain('HttpOnly');
  });

  it('2. POST /api/v1/auth/login - Authenticates valid user credentials', async () => {
    await request(app).post('/api/v1/auth/register').send(sampleUser);

    const loginRes = await request(app).post('/api/v1/auth/login').send({
      email: sampleUser.email,
      password: sampleUser.password,
    });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);
    expect(loginRes.body.data.user.email).toBe(sampleUser.email);
    expect(loginRes.body.data.accessToken).toBeDefined();
  });

  it('3. POST /api/v1/auth/login - Rejects invalid credentials', async () => {
    await request(app).post('/api/v1/auth/register').send(sampleUser);

    const res = await request(app).post('/api/v1/auth/login').send({
      email: sampleUser.email,
      password: 'WrongPassword999!',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toContain('Invalid email or password');
  });

  it('4. POST /api/v1/auth/refresh - Executes Refresh Token Rotation & invalidates old token', async () => {
    const regRes = await request(app).post('/api/v1/auth/register').send(sampleUser);

    // Extract initial refresh token cookie
    const cookies = regRes.headers['set-cookie'];
    const initialCookie = cookies[0];

    // First Refresh Call: should succeed with new token pair
    const refreshRes1 = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', [initialCookie]);

    expect(refreshRes1.status).toBe(200);
    expect(refreshRes1.body.success).toBe(true);
    expect(refreshRes1.body.data.accessToken).toBeDefined();

    const newCookie = refreshRes1.headers['set-cookie'][0];
    expect(newCookie).not.toBe(initialCookie);

    // Second Refresh Call using OLD token (Reused Token Detection): should fail & invalidate session
    const refreshRes2 = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', [initialCookie]);

    expect(refreshRes2.status).toBe(401);
    expect(refreshRes2.body.success).toBe(false);
  });
});
