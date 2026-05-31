import { Router } from 'express';

import { usersController } from '@/controllers/users.controller';

const router = Router();

router.get('/', usersController.getUsers);
router.get('/:id', usersController.getUserById);

export { router as usersRoutes };
