/**
 * Comments Controller
 */

import { Request, Response, NextFunction } from 'express';
import { postService } from '../services/post.service';
import { UnauthorizedError } from '../types/error.types';

class CommentsController {
  /** GET /api/v1/comments */
  async getAllComments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, status, userId } = req.query as any;
      const filters = {
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 20,
        status,
        userId,
      };

      const { comments, total } = await postService.getAllComments(filters);

      res.status(200).json({
        status: 'success',
        data: { comments },
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total,
          pages: Math.ceil(total / filters.limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/v1/comments/:id */
  async getCommentById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const comment = await postService.getCommentById(req.params.id!);

      res.status(200).json({
        status: 'success',
        data: { comment },
      });
    } catch (error) {
      next(error);
    }
  }

  /** PUT /api/v1/comments/:id */
  async updateComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) throw new UnauthorizedError('Authentication required');

      const comment = await postService.updateComment(
        req.params.id!,
        req.userId,
        req.user?.role ?? 'USER',
        req.body.content
      );

      res.status(200).json({
        status: 'success',
        message: 'Comment updated successfully',
        data: { comment },
      });
    } catch (error) {
      next(error);
    }
  }

  /** DELETE /api/v1/comments/:id */
  async deleteComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) throw new UnauthorizedError('Authentication required');

      await postService.deleteComment(
        req.params.id!,
        req.userId,
        req.user?.role ?? 'USER'
      );

      res.status(200).json({
        status: 'success',
        message: 'Comment deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /** PATCH /api/v1/comments/:id/approve */
  async approveComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const comment = await postService.approveComment(req.params.id!);

      res.status(200).json({
        status: 'success',
        message: 'Comment approved',
        data: { comment },
      });
    } catch (error) {
      next(error);
    }
  }

  /** PATCH /api/v1/comments/:id/reject */
  async rejectComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const comment = await postService.rejectComment(req.params.id!);

      res.status(200).json({
        status: 'success',
        message: 'Comment rejected',
        data: { comment },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const commentsController = new CommentsController();
