/**
 * Integration tests for Express app setup
 */

import request from 'supertest';
import { createApp } from '../../src/presentation/app';

describe('Express App', () => {
  const app = createApp();

  describe('Health Check Endpoints', () => {
    it('should return health status at /health', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('status', 'OK');
    });

    it('should return version at /api/version', async () => {
      const response = await request(app).get('/api/version');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('version');
    });

    it('should return welcome message at root /', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('message');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/unknown-route');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
    });

    it('should handle POST requests', async () => {
      const response = await request(app).post('/unknown-route').send({});

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('Content Type', () => {
    it('should return JSON content type', async () => {
      const response = await request(app).get('/health');

      expect(response.type).toMatch(/json/);
    });
  });
});
