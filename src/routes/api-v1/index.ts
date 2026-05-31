import { Router } from 'express';

import { usersRoutes } from './users.routes';
import { authRoutes } from './auth.routes';

const router = Router();

// Auth
router.use('/auth', authRoutes);

// Users
router.use('/users', usersRoutes);

export { router as apiV1Routes };

