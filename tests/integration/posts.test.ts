/**
 * Integration tests for posts endpoints
 */

import request from 'supertest';
import { createApp } from '../../src/app';

const app = createApp();
const authBase = '/api/v1/auth';
const postsBase = '/api/v1/posts';

let accessToken: string;
let createdPostId: string;

beforeAll(async () => {
  // Register and login a test user
  const email = `posts_test_${Date.now()}@example.com`;
  const password = 'PostsTest123!';

  await request(app)
    .post(`${authBase}/register`)
    .send({ name: 'Posts Test User', email, password, confirmPassword: password });

  const res = await request(app)
    .post(`${authBase}/login`)
    .send({ email, password });

  accessToken = res.body.data.accessToken;
});

describe('Posts Endpoints', () => {
  describe('GET /posts', () => {
    it('should return posts list', async () => {
      const res = await request(app).get(postsBase);
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data.posts)).toBe(true);
      expect(res.body.pagination).toBeDefined();
    });

    it('should support pagination', async () => {
      const res = await request(app).get(`${postsBase}?page=1&limit=5`);
      expect(res.status).toBe(200);
      expect(res.body.pagination.limit).toBe(5);
    });
  });

  describe('GET /posts/trending', () => {
    it('should return trending posts', async () => {
      const res = await request(app).get(`${postsBase}/trending`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.posts)).toBe(true);
    });
  });

  describe('POST /posts', () => {
    it('should create a post when authenticated', async () => {
      const res = await request(app)
        .post(postsBase)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Integration Test Post',
          content: 'Content for integration test',
          status: 'PUBLISHED',
          tags: ['test', 'integration'],
        });

      expect(res.status).toBe(201);
      expect(res.body.data.post.title).toBe('Integration Test Post');
      createdPostId = res.body.data.post.id;
    });

    it('should return 401 without auth', async () => {
      const res = await request(app)
        .post(postsBase)
        .send({ title: 'Test', content: 'Test' });
      expect(res.status).toBe(401);
    });

    it('should return 400 for missing required fields', async () => {
      const res = await request(app)
        .post(postsBase)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'No content' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /posts/:id', () => {
    it('should return a post by ID', async () => {
      const res = await request(app).get(`${postsBase}/${createdPostId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.post.id).toBe(createdPostId);
    });

    it('should return 404 for unknown post', async () => {
      const res = await request(app).get(`${postsBase}/nonexistent_id`);
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /posts/:id', () => {
    it('should update own post', async () => {
      const res = await request(app)
        .put(`${postsBase}/${createdPostId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Updated Integration Post' });

      expect(res.status).toBe(200);
      expect(res.body.data.post.title).toBe('Updated Integration Post');
    });
  });

  describe('POST /posts/:id/like', () => {
    it('should like a post', async () => {
      const res = await request(app)
        .post(`${postsBase}/${createdPostId}/like`)
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(200);
      expect(typeof res.body.data.likes).toBe('number');
    });
  });

  describe('POST /posts/:id/comments', () => {
    it('should add a comment to a published post', async () => {
      const res = await request(app)
        .post(`${postsBase}/${createdPostId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'Great test post!' });

      expect(res.status).toBe(201);
      expect(res.body.data.comment.content).toBe('Great test post!');
      expect(res.body.data.comment.status).toBe('PENDING');
    });
  });

  describe('GET /posts/:id/comments', () => {
    it('should return comments for a post', async () => {
      const res = await request(app).get(`${postsBase}/${createdPostId}/comments`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.comments)).toBe(true);
    });
  });

  describe('DELETE /posts/:id', () => {
    it('should delete own post', async () => {
      const res = await request(app)
        .delete(`${postsBase}/${createdPostId}`)
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(200);
    });

    it('should return 404 after deletion', async () => {
      const res = await request(app).get(`${postsBase}/${createdPostId}`);
      expect(res.status).toBe(404);
    });
  });
});
