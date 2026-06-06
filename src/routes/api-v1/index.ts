/**
 * API v1 routes aggregator
 */

import { Router } from 'express';
import { authRoutes } from './auth.routes';
import { usersRoutes } from './users.routes';
import { postsRoutes } from './posts.routes';
import { commentsRoutes } from './comments.routes';

const router = Router();

// Welcome endpoint
router.get('/', (_req, res) => {
  res.json({
    status: 'success',
    message: 'Velocity API v1',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      posts: '/api/v1/posts',
      comments: '/api/v1/comments',
      docs: '/api-docs',
      health: '/health',
    },
  });
});

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/posts', postsRoutes);
router.use('/comments', commentsRoutes);

export { router as apiV1Routes };
