/**
 * Post and Comment related types
 */

export type PostStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type CommentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Post {
  id: string;
  userId: string;
  title: string;
  content: string;
  excerpt?: string | undefined;
  status: PostStatus;
  likes: number;
  viewCount: number;
  commentCount: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date | undefined;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  likes: number;
  status: CommentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePostInput {
  title: string;
  content: string;
  excerpt?: string;
  status?: PostStatus;
  tags?: string[];
}

export interface UpdatePostInput {
  title?: string;
  content?: string;
  excerpt?: string;
  status?: PostStatus;
  tags?: string[];
}

export interface CreateCommentInput {
  content: string;
}

export interface UpdateCommentInput {
  content: string;
}

export interface PostFilters {
  page?: number | undefined;
  limit?: number | undefined;
  status?: PostStatus | undefined;
  userId?: string | undefined;
  tags?: string[] | undefined;
  search?: string | undefined;
  sort?: string | undefined;
  order?: 'asc' | 'desc' | undefined;
}

export interface CommentFilters {
  page?: number | undefined;
  limit?: number | undefined;
  status?: CommentStatus | undefined;
  userId?: string | undefined;
}
