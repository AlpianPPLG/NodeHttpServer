/**
 * Authentication request/response schemas using Zod
 */

import { z } from 'zod';

// Register request schema
export const registerSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .min(5, 'Email must be at least 5 characters')
    .max(255, 'Email must not exceed 255 characters'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must not exceed 30 characters')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Username can only contain letters, numbers, hyphens, and underscores'
    ),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(255, 'Password must not exceed 255 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(
      /[^A-Za-z0-9]/,
      'Password must contain at least one special character'
    ),
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must not exceed 50 characters')
    .optional(),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must not exceed 50 characters')
    .optional(),
});

export type RegisterRequest = z.infer<typeof registerSchema>;

// Login request schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginRequest = z.infer<typeof loginSchema>;

// Refresh token request schema
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type RefreshTokenRequest = z.infer<typeof refreshTokenSchema>;

// Auth response schema
export const authResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(), // seconds
  user: z.object({
    id: z.string(),
    email: z.string(),
    username: z.string(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
  }),
});

export type AuthResponse = z.infer<typeof authResponseSchema>;

// User response schema
export const userResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  username: z.string(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  avatar: z.string().nullable(),
  bio: z.string().nullable(),
  isActive: z.boolean(),
  isEmailVerified: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UserResponse = z.infer<typeof userResponseSchema>;
