/**
 * Integration tests for auth endpoints
 */

import request from 'supertest';
import { createApp } from '../../src/app';

const app = createApp();
const base = '/api/v1/auth';

let accessToken: string;
let refreshToken: string;
const email = `integration_${Date.now()}@example.com`;
const password = 'IntegrationPass123!';

describe('Auth Endpoints', () => {
  describe('POST /auth/register', () => {
    it('should register a new user and return tokens', async () => {
      const res = await request(app)
        .post(`${base}/register`)
        .send({ name: 'Integration User', email, password, confirmPassword: password });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      accessToken = res.body.data.accessToken;
      refreshToken = res.body.data.refreshToken;
    });

    it('should reject duplicate email with 409', async () => {
      const res = await request(app)
        .post(`${base}/register`)
        .send({ name: 'Dup', email, password, confirmPassword: password });
      expect(res.status).toBe(409);
    });

    it('should return 400 for missing fields', async () => {
      const res = await request(app)
        .post(`${base}/register`)
        .send({ email: 'incomplete@example.com' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should login with correct credentials', async () => {
      const res = await request(app)
        .post(`${base}/login`)
        .send({ email, password });

      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('should reject wrong password with 401', async () => {
      const res = await request(app)
        .post(`${base}/login`)
        .send({ email, password: 'WrongPass123!' });
      expect(res.status).toBe(401);
    });

    it('should reject unknown email with 401', async () => {
      const res = await request(app)
        .post(`${base}/login`)
        .send({ email: 'nobody@example.com', password });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /auth/profile', () => {
    it('should return profile with valid token', async () => {
      const res = await request(app)
        .get(`${base}/profile`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe(email);
    });

    it('should return 401 without token', async () => {
      const res = await request(app).get(`${base}/profile`);
      expect(res.status).toBe(401);
    });

    it('should return 401 with invalid token', async () => {
      const res = await request(app)
        .get(`${base}/profile`)
        .set('Authorization', 'Bearer invalidtoken');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /auth/refresh', () => {
    it('should refresh token successfully', async () => {
      const res = await request(app)
        .post(`${base}/refresh`)
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('should reject an access token as refresh token', async () => {
      const res = await request(app)
        .post(`${base}/refresh`)
        .send({ refreshToken: accessToken });
      expect(res.status).toBe(401);
    });
  });

  describe('PUT /auth/profile', () => {
    it('should update profile name', async () => {
      const res = await request(app)
        .put(`${base}/profile`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Updated Name' });

      expect(res.status).toBe(200);
      expect(res.body.data.user.name).toBe('Updated Name');
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout successfully', async () => {
      const res = await request(app)
        .post(`${base}/logout`)
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(200);
    });
  });
});
