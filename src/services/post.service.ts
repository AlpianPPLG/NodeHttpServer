/**
 * Post Service - Business logic for posts and comments
 */

import { mockPostRepository, mockCommentRepository } from '../repositories/mock-post.repository';
import { mockUserRepository } from '../repositories/mock-user.repository';
import { Post, Comment, PostFilters, CommentFilters } from '../types/post.types';
import { NotFoundError, ForbiddenError, BadRequestError } from '../types/error.types';
import { logger } from '../utils/logger';

class PostService {
  // ─── POSTS ───────────────────────────────────────────────────────────────────

  async getAllPosts(filters: PostFilters): Promise<{ posts: Post[]; total: number }> {
    const [posts, total] = await Promise.all([
      mockPostRepository.findAll(filters),
      mockPostRepository.count({
        status: filters.status,
        userId: filters.userId,
        tags: filters.tags,
        search: filters.search,
      }),
    ]);
    return { posts, total };
  }

  async getPostById(id: string, incrementViews = true): Promise<Post> {
    const post = await mockPostRepository.findById(id);
    if (!post) throw new NotFoundError('Post not found');

    if (incrementViews && post.status === 'PUBLISHED') {
      await mockPostRepository.incrementViews(id);
    }

    return post;
  }

  async createPost(
    userId: string,
    data: { title: string; content: string; excerpt?: string; status?: any; tags?: string[] }
  ): Promise<Post> {
    const post = await mockPostRepository.create(userId, data);

    logger.info('Post created', { component: 'post-service', postId: post.id, userId });
    return post;
  }

  async updatePost(
    id: string,
    userId: string,
    role: string,
    data: { title?: string; content?: string; excerpt?: string; status?: any; tags?: string[] }
  ): Promise<Post> {
    const post = await mockPostRepository.findById(id);
    if (!post) throw new NotFoundError('Post not found');

    // Only owner or admin can update
    if (post.userId !== userId && role !== 'ADMIN') {
      throw new ForbiddenError('You can only edit your own posts');
    }

    const updated = await mockPostRepository.update(id, data);
    if (!updated) throw new NotFoundError('Post not found');

    logger.info('Post updated', { component: 'post-service', postId: id, userId });
    return updated;
  }

  async deletePost(id: string, userId: string, role: string): Promise<void> {
    const post = await mockPostRepository.findById(id);
    if (!post) throw new NotFoundError('Post not found');

    if (post.userId !== userId && role !== 'ADMIN') {
      throw new ForbiddenError('You can only delete your own posts');
    }

    await mockPostRepository.delete(id);
    logger.info('Post deleted', { component: 'post-service', postId: id, userId });
  }

  async likePost(id: string): Promise<Post> {
    const post = await mockPostRepository.findById(id);
    if (!post) throw new NotFoundError('Post not found');
    if (post.status !== 'PUBLISHED') throw new BadRequestError('Can only like published posts');

    const updated = await mockPostRepository.likePost(id);
    return updated!;
  }

  async unlikePost(id: string): Promise<Post> {
    const post = await mockPostRepository.findById(id);
    if (!post) throw new NotFoundError('Post not found');

    const updated = await mockPostRepository.unlikePost(id);
    return updated!;
  }

  async getUserPosts(userId: string, filters: PostFilters): Promise<{ posts: Post[]; total: number }> {
    return this.getAllPosts({ ...filters, userId });
  }

  async getTrendingPosts(limit = 10): Promise<Post[]> {
    const posts = await mockPostRepository.findAll({
      status: 'PUBLISHED',
      sort: 'likes',
      order: 'desc',
      limit,
      page: 1,
    });
    return posts;
  }

  // ─── COMMENTS ────────────────────────────────────────────────────────────────

  async getPostComments(
    postId: string,
    filters: CommentFilters
  ): Promise<{ comments: Comment[]; total: number }> {
    const post = await mockPostRepository.findById(postId);
    if (!post) throw new NotFoundError('Post not found');

    const [comments, total] = await Promise.all([
      mockCommentRepository.findByPostId(postId, filters),
      mockCommentRepository.countByPostId(postId),
    ]);

    return { comments, total };
  }

  async createComment(postId: string, userId: string, content: string): Promise<Comment> {
    const post = await mockPostRepository.findById(postId);
    if (!post) throw new NotFoundError('Post not found');
    if (post.status !== 'PUBLISHED') throw new BadRequestError('Cannot comment on unpublished posts');

    const user = await mockUserRepository.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    const comment = await mockCommentRepository.create(postId, userId, content);
    logger.info('Comment created', { component: 'post-service', commentId: comment.id, postId, userId });
    return comment;
  }

  async updateComment(id: string, userId: string, role: string, content: string): Promise<Comment> {
    const comment = await mockCommentRepository.findById(id);
    if (!comment) throw new NotFoundError('Comment not found');

    if (comment.userId !== userId && role !== 'ADMIN') {
      throw new ForbiddenError('You can only edit your own comments');
    }

    const updated = await mockCommentRepository.update(id, content);
    if (!updated) throw new NotFoundError('Comment not found');
    return updated;
  }

  async deleteComment(id: string, userId: string, role: string): Promise<void> {
    const comment = await mockCommentRepository.findById(id);
    if (!comment) throw new NotFoundError('Comment not found');

    if (comment.userId !== userId && role !== 'ADMIN') {
      throw new ForbiddenError('You can only delete your own comments');
    }

    await mockCommentRepository.delete(id);
    logger.info('Comment deleted', { component: 'post-service', commentId: id, userId });
  }

  async approveComment(id: string): Promise<Comment> {
    const comment = await mockCommentRepository.findById(id);
    if (!comment) throw new NotFoundError('Comment not found');

    const updated = await mockCommentRepository.updateStatus(id, 'APPROVED');
    return updated!;
  }

  async rejectComment(id: string): Promise<Comment> {
    const comment = await mockCommentRepository.findById(id);
    if (!comment) throw new NotFoundError('Comment not found');

    const updated = await mockCommentRepository.updateStatus(id, 'REJECTED');
    return updated!;
  }

  async getAllComments(filters: CommentFilters): Promise<{ comments: Comment[]; total: number }> {
    const [comments, total] = await Promise.all([
      mockCommentRepository.findAll(filters),
      mockCommentRepository.count({ status: filters.status, userId: filters.userId }),
    ]);
    return { comments, total };
  }

  async getCommentById(id: string): Promise<Comment> {
    const comment = await mockCommentRepository.findById(id);
    if (!comment) throw new NotFoundError('Comment not found');
    return comment;
  }
}

export const postService = new PostService();
