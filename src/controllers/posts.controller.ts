/**
 * Posts Controller
 */

import { Request, Response, NextFunction } from 'express';
import { postService } from '../services/post.service';
import { UnauthorizedError } from '../types/error.types';

class PostsController {
  // ─── POSTS ───────────────────────────────────────────────────────────────────

  /** GET /api/v1/posts */
  async getAllPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, status, userId, tags, search, sort, order } = req.query as any;

      const filters = {
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 20,
        status,
        userId,
        tags: tags ? (tags as string).split(',').map((t: string) => t.trim()) : undefined,
        search,
        sort: sort ?? 'createdAt',
        order: order ?? 'desc',
      };

      const { posts, total } = await postService.getAllPosts(filters);

      res.status(200).json({
        status: 'success',
        data: { posts },
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total,
          pages: Math.ceil(total / filters.limit),
          hasNext: filters.page * filters.limit < total,
          hasPrev: filters.page > 1,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/v1/posts/trending */
  async getTrendingPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const posts = await postService.getTrendingPosts(limit);

      res.status(200).json({
        status: 'success',
        data: { posts },
      });
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/v1/posts/:id */
  async getPostById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const post = await postService.getPostById(req.params.id!);

      res.status(200).json({
        status: 'success',
        data: { post },
      });
    } catch (error) {
      next(error);
    }
  }

  /** POST /api/v1/posts */
  async createPost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) throw new UnauthorizedError('Authentication required');

      const post = await postService.createPost(req.userId, req.body);

      res.status(201).json({
        status: 'success',
        message: 'Post created successfully',
        data: { post },
      });
    } catch (error) {
      next(error);
    }
  }

  /** PUT /api/v1/posts/:id */
  async updatePost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) throw new UnauthorizedError('Authentication required');

      const post = await postService.updatePost(
        req.params.id!,
        req.userId,
        req.user?.role ?? 'USER',
        req.body
      );

      res.status(200).json({
        status: 'success',
        message: 'Post updated successfully',
        data: { post },
      });
    } catch (error) {
      next(error);
    }
  }

  /** DELETE /api/v1/posts/:id */
  async deletePost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) throw new UnauthorizedError('Authentication required');

      await postService.deletePost(req.params.id!, req.userId, req.user?.role ?? 'USER');

      res.status(200).json({
        status: 'success',
        message: 'Post deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /** POST /api/v1/posts/:id/like */
  async likePost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const post = await postService.likePost(req.params.id!);

      res.status(200).json({
        status: 'success',
        message: 'Post liked',
        data: { likes: post.likes },
      });
    } catch (error) {
      next(error);
    }
  }

  /** DELETE /api/v1/posts/:id/like */
  async unlikePost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const post = await postService.unlikePost(req.params.id!);

      res.status(200).json({
        status: 'success',
        message: 'Post unliked',
        data: { likes: post.likes },
      });
    } catch (error) {
      next(error);
    }
  }

  // ─── COMMENTS ────────────────────────────────────────────────────────────────

  /** GET /api/v1/posts/:id/comments */
  async getPostComments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit } = req.query as any;
      const filters = {
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 20,
        status: 'APPROVED' as const,
      };

      const { comments, total } = await postService.getPostComments(req.params.id!, filters);

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

  /** POST /api/v1/posts/:id/comments */
  async createComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) throw new UnauthorizedError('Authentication required');

      const comment = await postService.createComment(
        req.params.id!,
        req.userId,
        req.body.content
      );

      res.status(201).json({
        status: 'success',
        message: 'Comment submitted, pending approval',
        data: { comment },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const postsController = new PostsController();
