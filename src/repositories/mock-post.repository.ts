/**
 * Mock Post Repository
 * In-memory storage for development without a database
 */

import { Post, Comment, CreatePostInput, UpdatePostInput, PostFilters, CommentFilters, PostStatus, CommentStatus } from '../types/post.types';
import { logger } from '../utils/logger';

// In-memory storage
const posts: Map<string, Post> = new Map();
const comments: Map<string, Comment> = new Map();

let postIdCounter = 1;
let commentIdCounter = 1;

function generatePostId(): string {
  return `post_${postIdCounter++}`;
}

function generateCommentId(): string {
  return `comment_${commentIdCounter++}`;
}

// Seed some sample posts
function initializeSampleData(): void {
  const samplePosts: Post[] = [
    {
      id: generatePostId(),
      userId: 'user_1',
      title: 'Welcome to Velocity',
      content: 'This is the first post on Velocity, a modern HTTP server built with Node.js, Express, and TypeScript.',
      excerpt: 'Welcome to Velocity HTTP Server!',
      status: 'PUBLISHED',
      likes: 10,
      viewCount: 150,
      commentCount: 2,
      tags: ['velocity', 'nodejs', 'typescript'],
      createdAt: new Date('2026-06-01'),
      updatedAt: new Date('2026-06-01'),
      publishedAt: new Date('2026-06-01'),
    },
    {
      id: generatePostId(),
      userId: 'user_1',
      title: 'Getting Started with TypeScript',
      content: 'TypeScript brings type safety to JavaScript, making large codebases much more maintainable.',
      excerpt: 'A beginner guide to TypeScript',
      status: 'PUBLISHED',
      likes: 25,
      viewCount: 320,
      commentCount: 1,
      tags: ['typescript', 'javascript', 'programming'],
      createdAt: new Date('2026-06-02'),
      updatedAt: new Date('2026-06-02'),
      publishedAt: new Date('2026-06-02'),
    },
    {
      id: generatePostId(),
      userId: 'user_2',
      title: 'Draft Post - Work in Progress',
      content: 'This is a draft post that is not yet published.',
      status: 'DRAFT',
      likes: 0,
      viewCount: 0,
      commentCount: 0,
      tags: ['draft'],
      createdAt: new Date('2026-06-03'),
      updatedAt: new Date('2026-06-03'),
    },
  ];

  for (const post of samplePosts) {
    posts.set(post.id, post);
  }

  // Sample comments
  const sampleComments: Comment[] = [
    {
      id: generateCommentId(),
      postId: 'post_1',
      userId: 'user_2',
      content: 'Great post! Looking forward to more content.',
      likes: 3,
      status: 'APPROVED',
      createdAt: new Date('2026-06-01T10:00:00'),
      updatedAt: new Date('2026-06-01T10:00:00'),
    },
    {
      id: generateCommentId(),
      postId: 'post_1',
      userId: 'user_1',
      content: 'Thanks for the feedback!',
      likes: 1,
      status: 'APPROVED',
      createdAt: new Date('2026-06-01T11:00:00'),
      updatedAt: new Date('2026-06-01T11:00:00'),
    },
    {
      id: generateCommentId(),
      postId: 'post_2',
      userId: 'user_2',
      content: 'TypeScript is amazing, I agree!',
      likes: 5,
      status: 'APPROVED',
      createdAt: new Date('2026-06-02T09:00:00'),
      updatedAt: new Date('2026-06-02T09:00:00'),
    },
  ];

  for (const comment of sampleComments) {
    comments.set(comment.id, comment);
  }

  logger.info('Mock post data initialized', { postCount: posts.size, commentCount: comments.size });
}

initializeSampleData();

// ─── POST REPOSITORY ───────────────────────────────────────────────────────────

export class MockPostRepository {
  async findAll(filters?: PostFilters): Promise<Post[]> {
    let list = Array.from(posts.values());

    if (filters?.status) {
      list = list.filter(p => p.status === filters.status);
    }
    if (filters?.userId) {
      list = list.filter(p => p.userId === filters.userId);
    }
    if (filters?.tags && filters.tags.length > 0) {
      list = list.filter(p => filters.tags!.some(tag => p.tags.includes(tag)));
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        p =>
          p.title.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q)
      );
    }

    // Sort
    const sortField = (filters?.sort ?? 'createdAt') as keyof Post;
    const order = filters?.order ?? 'desc';
    list.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal === undefined || bVal === undefined) return 0;
      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });

    // Paginate
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 20;
    const start = (page - 1) * limit;
    return list.slice(start, start + limit);
  }

  async count(filters?: Pick<PostFilters, 'status' | 'userId' | 'tags' | 'search'>): Promise<number> {
    let list = Array.from(posts.values());
    if (filters?.status) list = list.filter(p => p.status === filters.status);
    if (filters?.userId) list = list.filter(p => p.userId === filters.userId);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(p => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q));
    }
    return list.length;
  }

  async findById(id: string): Promise<Post | null> {
    return posts.get(id) ?? null;
  }

  async create(userId: string, data: CreatePostInput): Promise<Post> {
    const id = generatePostId();
    const now = new Date();
    const post: Post = {
      id,
      userId,
      title: data.title,
      content: data.content,
      excerpt: data.excerpt,
      status: data.status ?? 'DRAFT',
      likes: 0,
      viewCount: 0,
      commentCount: 0,
      tags: data.tags ?? [],
      createdAt: now,
      updatedAt: now,
      publishedAt: data.status === 'PUBLISHED' ? now : undefined,
    };
    posts.set(id, post);
    logger.info('Post created', { postId: id, userId });
    return post;
  }

  async update(id: string, data: UpdatePostInput): Promise<Post | null> {
    const post = posts.get(id);
    if (!post) return null;

    const updated: Post = {
      ...post,
      ...data,
      id,
      updatedAt: new Date(),
      publishedAt:
        data.status === 'PUBLISHED' && !post.publishedAt
          ? new Date()
          : post.publishedAt,
    };
    posts.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    if (!posts.has(id)) return false;
    posts.delete(id);
    // Delete all comments for this post
    for (const [cid, comment] of comments.entries()) {
      if (comment.postId === id) comments.delete(cid);
    }
    logger.info('Post deleted', { postId: id });
    return true;
  }

  async incrementViews(id: string): Promise<void> {
    const post = posts.get(id);
    if (post) posts.set(id, { ...post, viewCount: post.viewCount + 1 });
  }

  async likePost(id: string): Promise<Post | null> {
    const post = posts.get(id);
    if (!post) return null;
    const updated = { ...post, likes: post.likes + 1, updatedAt: new Date() };
    posts.set(id, updated);
    return updated;
  }

  async unlikePost(id: string): Promise<Post | null> {
    const post = posts.get(id);
    if (!post) return null;
    const updated = { ...post, likes: Math.max(0, post.likes - 1), updatedAt: new Date() };
    posts.set(id, updated);
    return updated;
  }
}

// ─── COMMENT REPOSITORY ────────────────────────────────────────────────────────

export class MockCommentRepository {
  async findByPostId(postId: string, filters?: CommentFilters): Promise<Comment[]> {
    let list = Array.from(comments.values()).filter(c => c.postId === postId);

    if (filters?.status) {
      list = list.filter(c => c.status === filters.status);
    }
    if (filters?.userId) {
      list = list.filter(c => c.userId === filters.userId);
    }

    list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 20;
    return list.slice((page - 1) * limit, (page - 1) * limit + limit);
  }

  async countByPostId(postId: string): Promise<number> {
    return Array.from(comments.values()).filter(c => c.postId === postId).length;
  }

  async findById(id: string): Promise<Comment | null> {
    return comments.get(id) ?? null;
  }

  async findAll(filters?: CommentFilters): Promise<Comment[]> {
    let list = Array.from(comments.values());
    if (filters?.status) list = list.filter(c => c.status === filters.status);
    if (filters?.userId) list = list.filter(c => c.userId === filters.userId);
    list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 20;
    return list.slice((page - 1) * limit, (page - 1) * limit + limit);
  }

  async count(filters?: Pick<CommentFilters, 'status' | 'userId'>): Promise<number> {
    let list = Array.from(comments.values());
    if (filters?.status) list = list.filter(c => c.status === filters.status);
    if (filters?.userId) list = list.filter(c => c.userId === filters.userId);
    return list.length;
  }

  async create(postId: string, userId: string, content: string): Promise<Comment> {
    const id = generateCommentId();
    const now = new Date();
    const comment: Comment = {
      id,
      postId,
      userId,
      content,
      likes: 0,
      status: 'PENDING',
      createdAt: now,
      updatedAt: now,
    };
    comments.set(id, comment);

    // Increment post comment count
    const post = posts.get(postId);
    if (post) posts.set(postId, { ...post, commentCount: post.commentCount + 1 });

    logger.info('Comment created', { commentId: id, postId, userId });
    return comment;
  }

  async update(id: string, content: string): Promise<Comment | null> {
    const comment = comments.get(id);
    if (!comment) return null;
    const updated = { ...comment, content, updatedAt: new Date() };
    comments.set(id, updated);
    return updated;
  }

  async updateStatus(id: string, status: CommentStatus): Promise<Comment | null> {
    const comment = comments.get(id);
    if (!comment) return null;
    const updated = { ...comment, status, updatedAt: new Date() };
    comments.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const comment = comments.get(id);
    if (!comment) return false;
    comments.delete(id);
    // Decrement post comment count
    const post = posts.get(comment.postId);
    if (post) {
      posts.set(comment.postId, {
        ...post,
        commentCount: Math.max(0, post.commentCount - 1),
      });
    }
    logger.info('Comment deleted', { commentId: id });
    return true;
  }

  async likeComment(id: string): Promise<Comment | null> {
    const comment = comments.get(id);
    if (!comment) return null;
    const updated = { ...comment, likes: comment.likes + 1, updatedAt: new Date() };
    comments.set(id, updated);
    return updated;
  }
}

export const mockPostRepository = new MockPostRepository();
export const mockCommentRepository = new MockCommentRepository();
