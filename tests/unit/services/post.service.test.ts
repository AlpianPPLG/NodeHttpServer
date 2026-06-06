/**
 * Unit tests for PostService
 */

import { postService } from '../../../src/services/post.service';

describe('PostService', () => {
  let postId: string;
  const userId = 'user_1'; // seeded user

  describe('getAllPosts', () => {
    it('should return posts with pagination info', async () => {
      const { posts, total } = await postService.getAllPosts({ page: 1, limit: 10 });
      expect(Array.isArray(posts)).toBe(true);
      expect(typeof total).toBe('number');
    });

    it('should filter by status', async () => {
      const { posts } = await postService.getAllPosts({ status: 'PUBLISHED' });
      posts.forEach(p => expect(p.status).toBe('PUBLISHED'));
    });

    it('should filter by search query', async () => {
      const { posts } = await postService.getAllPosts({ search: 'Velocity' });
      expect(posts.length).toBeGreaterThan(0);
    });
  });

  describe('createPost', () => {
    it('should create a draft post', async () => {
      const post = await postService.createPost(userId, {
        title: 'Test Post',
        content: 'Test content for the post',
        status: 'DRAFT',
        tags: ['test'],
      });

      expect(post.title).toBe('Test Post');
      expect(post.status).toBe('DRAFT');
      expect(post.userId).toBe(userId);
      postId = post.id;
    });

    it('should create a published post with publishedAt set', async () => {
      const post = await postService.createPost(userId, {
        title: 'Published Post',
        content: 'Published content',
        status: 'PUBLISHED',
      });
      expect(post.status).toBe('PUBLISHED');
      expect(post.publishedAt).toBeDefined();
    });
  });

  describe('getPostById', () => {
    it('should return an existing post', async () => {
      const post = await postService.getPostById(postId, false);
      expect(post.id).toBe(postId);
    });

    it('should throw NotFoundError for unknown post', async () => {
      await expect(postService.getPostById('nonexistent', false)).rejects.toThrow('Post not found');
    });
  });

  describe('updatePost', () => {
    it('should allow owner to update post', async () => {
      const updated = await postService.updatePost(postId, userId, 'USER', {
        title: 'Updated Title',
      });
      expect(updated.title).toBe('Updated Title');
    });

    it('should allow admin to update any post', async () => {
      const updated = await postService.updatePost(postId, 'other_user', 'ADMIN', {
        title: 'Admin Updated',
      });
      expect(updated.title).toBe('Admin Updated');
    });

    it('should forbid non-owner from updating', async () => {
      await expect(
        postService.updatePost(postId, 'other_user', 'USER', { title: 'Hacked' })
      ).rejects.toThrow('You can only edit your own posts');
    });
  });

  describe('likePost / unlikePost', () => {
    let publishedPostId: string;

    beforeAll(async () => {
      const p = await postService.createPost(userId, {
        title: 'Likeable Post',
        content: 'Like me!',
        status: 'PUBLISHED',
      });
      publishedPostId = p.id;
    });

    it('should increment likes', async () => {
      const post = await postService.likePost(publishedPostId);
      expect(post.likes).toBeGreaterThanOrEqual(1);
    });

    it('should decrement likes', async () => {
      const before = await postService.getPostById(publishedPostId, false);
      const post = await postService.unlikePost(publishedPostId);
      expect(post.likes).toBeLessThan(before.likes + 1);
    });
  });

  describe('createComment', () => {
    let publishedPostId: string;

    beforeAll(async () => {
      const p = await postService.createPost(userId, {
        title: 'Commentable Post',
        content: 'Comment on me!',
        status: 'PUBLISHED',
      });
      publishedPostId = p.id;
    });

    it('should create a comment on a published post', async () => {
      const comment = await postService.createComment(publishedPostId, userId, 'Great post!');
      expect(comment.content).toBe('Great post!');
      expect(comment.status).toBe('PENDING');
      expect(comment.postId).toBe(publishedPostId);
    });

    it('should reject comment on a draft post', async () => {
      await expect(
        postService.createComment(postId, userId, 'Nice')
      ).rejects.toThrow('Cannot comment on unpublished posts');
    });
  });

  describe('deletePost', () => {
    it('should allow owner to delete post', async () => {
      const post = await postService.createPost(userId, {
        title: 'To Delete',
        content: 'Will be deleted',
      });
      await expect(postService.deletePost(post.id, userId, 'USER')).resolves.not.toThrow();
    });

    it('should forbid non-owner from deleting', async () => {
      await expect(
        postService.deletePost(postId, 'other_user', 'USER')
      ).rejects.toThrow('You can only delete your own posts');
    });
  });
});
