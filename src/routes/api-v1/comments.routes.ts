/**
 * Comments routes
 */

import { Router } from 'express';
import { commentsController } from '../../controllers/comments.controller';
import { authenticateToken, requireModerator } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validation.middleware';
import { UpdateCommentSchema } from '../../schemas/post.schema';

const router = Router();

/** GET /api/v1/comments */
router.get('/', authenticateToken, requireModerator, commentsController.getAllComments.bind(commentsController));

/** GET /api/v1/comments/:id */
router.get('/:id', commentsController.getCommentById.bind(commentsController));

/** PUT /api/v1/comments/:id */
router.put(
  '/:id',
  authenticateToken,
  validateRequest(UpdateCommentSchema),
  commentsController.updateComment.bind(commentsController)
);

/** DELETE /api/v1/comments/:id */
router.delete(
  '/:id',
  authenticateToken,
  commentsController.deleteComment.bind(commentsController)
);

/** PATCH /api/v1/comments/:id/approve */
router.patch(
  '/:id/approve',
  authenticateToken,
  requireModerator,
  commentsController.approveComment.bind(commentsController)
);

/** PATCH /api/v1/comments/:id/reject */
router.patch(
  '/:id/reject',
  authenticateToken,
  requireModerator,
  commentsController.rejectComment.bind(commentsController)
);

export { router as commentsRoutes };
