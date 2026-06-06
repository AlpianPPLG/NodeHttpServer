/**
 * Post and Comment validation schemas
 */

import { z } from 'zod';

export const PostStatusEnum = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);
export const CommentStatusEnum = z.enum(['PENDING', 'APPROVED', 'REJECTED']);

// ─── POST SCHEMAS ──────────────────────────────────────────────────────────────

export const CreatePostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').trim(),
  content: z.string().min(1, 'Content is required').max(50000, 'Content too long').trim(),
  excerpt: z.string().max(500, 'Excerpt too long').trim().optional(),
  status: PostStatusEnum.optional().default('DRAFT'),
  tags: z
    .array(z.string().min(1).max(50).trim())
    .max(10, 'Maximum 10 tags allowed')
    .optional()
    .default([]),
});

export const UpdatePostSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').max(200, 'Title too long').trim().optional(),
  content: z.string().min(1, 'Content cannot be empty').max(50000, 'Content too long').trim().optional(),
  excerpt: z.string().max(500, 'Excerpt too long').trim().optional(),
  status: PostStatusEnum.optional(),
  tags: z
    .array(z.string().min(1).max(50).trim())
    .max(10, 'Maximum 10 tags allowed')
    .optional(),
});

export const PostQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform(v => (v ? parseInt(v, 10) : 1))
    .refine(v => v > 0, 'Page must be positive'),
  limit: z
    .string()
    .optional()
    .transform(v => (v ? parseInt(v, 10) : 20))
    .refine(v => v > 0 && v <= 100, 'Limit must be 1-100'),
  status: PostStatusEnum.optional(),
  userId: z.string().optional(),
  tags: z
    .string()
    .optional()
    .transform(v => (v ? v.split(',').map(t => t.trim()) : undefined)),
  search: z.string().max(200).optional(),
  sort: z
    .enum(['createdAt', 'updatedAt', 'likes', 'viewCount', 'title'])
    .optional()
    .default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

// ─── COMMENT SCHEMAS ───────────────────────────────────────────────────────────

export const CreateCommentSchema = z.object({
  content: z.string().min(1, 'Content is required').max(2000, 'Comment too long').trim(),
});

export const UpdateCommentSchema = z.object({
  content: z.string().min(1, 'Content cannot be empty').max(2000, 'Comment too long').trim(),
});

export const CommentQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform(v => (v ? parseInt(v, 10) : 1))
    .refine(v => v > 0, 'Page must be positive'),
  limit: z
    .string()
    .optional()
    .transform(v => (v ? parseInt(v, 10) : 20))
    .refine(v => v > 0 && v <= 100, 'Limit must be 1-100'),
  status: CommentStatusEnum.optional(),
});

// ─── INFERRED TYPES ────────────────────────────────────────────────────────────

export type CreatePostInput = z.infer<typeof CreatePostSchema>;
export type UpdatePostInput = z.infer<typeof UpdatePostSchema>;
export type PostQuery = z.infer<typeof PostQuerySchema>;
export type CreateCommentInput = z.infer<typeof CreateCommentSchema>;
export type UpdateCommentInput = z.infer<typeof UpdateCommentSchema>;
export type CommentQuery = z.infer<typeof CommentQuerySchema>;
