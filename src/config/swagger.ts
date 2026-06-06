/**
 * Swagger/OpenAPI configuration
 */

import swaggerJSDoc from 'swagger-jsdoc';
import { config } from './env';

const serverUrl =
  config.server.isProduction
    ? 'https://api.velocity.dev'
    : `http://localhost:${config.server.port}`;

const swaggerDefinition: swaggerJSDoc.OAS3Definition = {
  openapi: '3.0.0',
  info: {
    title: 'Velocity HTTP Server API',
    version: '1.0.0',
    description:
      'A modern, production-ready REST API built with Node.js + Express + TypeScript. ' +
      'Includes JWT authentication, RBAC, full CRUD for users/posts/comments, and more.',
    contact: {
      name: 'Velocity API Support',
      url: 'https://github.com/YourOrg/velocity',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: `${serverUrl}/api/v1`,
      description: config.server.isProduction ? 'Production' : 'Development',
    },
  ],
  tags: [
    { name: 'Auth', description: 'Authentication & authorization' },
    { name: 'Users', description: 'User management' },
    { name: 'Posts', description: 'Post management' },
    { name: 'Comments', description: 'Comment management' },
    { name: 'Health', description: 'Server health & status' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT access token',
      },
    },
    schemas: {
      // ── Common ──────────────────────────────────────────────────────────────
      SuccessResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'success' },
          message: { type: 'string', example: 'Operation successful' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'error' },
          code: { type: 'string', example: 'VALIDATION_ERROR' },
          message: { type: 'string', example: 'Validation failed' },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string' },
                message: { type: 'string' },
                code: { type: 'string' },
              },
            },
          },
        },
      },
      Pagination: {
        type: 'object',
        properties: {
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 20 },
          total: { type: 'integer', example: 100 },
          pages: { type: 'integer', example: 5 },
          hasNext: { type: 'boolean', example: true },
          hasPrev: { type: 'boolean', example: false },
        },
      },
      // ── Auth ────────────────────────────────────────────────────────────────
      RegisterRequest: {
        type: 'object',
        required: ['name', 'email', 'password', 'confirmPassword'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100, example: 'John Doe' },
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          password: { type: 'string', minLength: 8, example: 'SecurePass123!' },
          confirmPassword: { type: 'string', example: 'SecurePass123!' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          password: { type: 'string', example: 'SecurePass123!' },
        },
      },
      RefreshTokenRequest: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'success' },
          data: {
            type: 'object',
            properties: {
              user: { $ref: '#/components/schemas/UserProfile' },
              accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
              refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
              expiresIn: { type: 'integer', example: 86400 },
            },
          },
        },
      },
      // ── Users ───────────────────────────────────────────────────────────────
      UserProfile: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'user_1' },
          name: { type: 'string', example: 'John Doe' },
          email: { type: 'string', example: 'john@example.com' },
          role: { type: 'string', enum: ['USER', 'ADMIN', 'MODERATOR'], example: 'USER' },
          emailVerified: { type: 'boolean', example: false },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'user_1' },
          name: { type: 'string', example: 'John Doe' },
          email: { type: 'string', example: 'john@example.com' },
          role: { type: 'string', enum: ['USER', 'ADMIN', 'MODERATOR'] },
          status: { type: 'string', enum: ['ACTIVE', 'SUSPENDED', 'BANNED'] },
          emailVerified: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      // ── Posts ───────────────────────────────────────────────────────────────
      Post: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'post_1' },
          userId: { type: 'string', example: 'user_1' },
          title: { type: 'string', example: 'My First Post' },
          content: { type: 'string', example: 'Post content here...' },
          excerpt: { type: 'string', example: 'Short summary' },
          status: { type: 'string', enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'] },
          likes: { type: 'integer', example: 42 },
          viewCount: { type: 'integer', example: 1500 },
          commentCount: { type: 'integer', example: 8 },
          tags: { type: 'array', items: { type: 'string' }, example: ['nodejs', 'typescript'] },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          publishedAt: { type: 'string', format: 'date-time', nullable: true },
        },
      },
      CreatePostRequest: {
        type: 'object',
        required: ['title', 'content'],
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 200, example: 'My Post Title' },
          content: { type: 'string', minLength: 1, example: 'Post content...' },
          excerpt: { type: 'string', maxLength: 500, example: 'Short summary' },
          status: { type: 'string', enum: ['DRAFT', 'PUBLISHED'], default: 'DRAFT' },
          tags: { type: 'array', items: { type: 'string' }, example: ['nodejs'] },
        },
      },
      UpdatePostRequest: {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 200 },
          content: { type: 'string', minLength: 1 },
          excerpt: { type: 'string', maxLength: 500 },
          status: { type: 'string', enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'] },
          tags: { type: 'array', items: { type: 'string' } },
        },
      },
      // ── Comments ────────────────────────────────────────────────────────────
      Comment: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'comment_1' },
          postId: { type: 'string', example: 'post_1' },
          userId: { type: 'string', example: 'user_1' },
          content: { type: 'string', example: 'Great post!' },
          likes: { type: 'integer', example: 3 },
          status: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED'] },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateCommentRequest: {
        type: 'object',
        required: ['content'],
        properties: {
          content: { type: 'string', minLength: 1, maxLength: 2000, example: 'Great post!' },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: 'Missing or invalid authentication token',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: { status: 'error', code: 'UNAUTHORIZED', message: 'Authorization header missing' },
          },
        },
      },
      Forbidden: {
        description: 'Insufficient permissions',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: { status: 'error', code: 'FORBIDDEN', message: 'Insufficient permissions' },
          },
        },
      },
      NotFound: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: { status: 'error', code: 'NOT_FOUND', message: 'Resource not found' },
          },
        },
      },
      ValidationError: {
        description: 'Validation failed',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
    },
  },
};

export const swaggerSpec = swaggerJSDoc({
  definition: swaggerDefinition,
  apis: [
    'src/routes/api-v1/*.ts',
    'src/routes/*.ts',
  ],
});
