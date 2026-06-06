/**
 * Integration tests for health endpoint
 */

import request from 'supertest';
import { createApp } from '../../src/app';

const app = createApp();

describe('Health Endpoints', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.timestamp).toBeDefined();
      expect(res.body.uptime).toBeGreaterThanOrEqual(0);
      expect(res.body.version).toBeDefined();
    });
  });

  describe('GET /api/v1', () => {
    it('should return API welcome info', async () => {
      const res = await request(app).get('/api/v1');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.endpoints).toBeDefined();
    });
  });

  describe('404 handler', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await request(app).get('/nonexistent/route');
      expect(res.status).toBe(404);
    });
  });
});
