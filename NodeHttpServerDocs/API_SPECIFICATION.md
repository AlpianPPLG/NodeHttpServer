# 🔌 REST API Specification

**Velocity** menyediakan RESTful API yang comprehensive dengan 50+ endpoints untuk menangani semua operasi aplikasi.

---

## 📖 Table of Contents

1. [API Overview](#api-overview)
2. [Authentication](#authentication)
3. [Request/Response Format](#requestresponse-format)
4. [Error Handling](#error-handling)
5. [API Endpoints](#api-endpoints)
6. [Data Models](#data-models)
7. [Rate Limiting](#rate-limiting)
8. [Pagination & Filtering](#pagination--filtering)

---

## 🎯 API Overview

### Base URL

```
Development:  http://localhost:3000/api/v1
Production:   https://api.velocity.dev/api/v1
Sandbox:      https://sandbox.velocity-api.dev/api/v1
```

### API Versioning

- **Current Version**: v1
- **Versioning Strategy**: URL-based (`/api/v1`)
- **Deprecation Policy**: 6-month notice before removal
- **Sunset Header**: `Sunset: Sun, 31 Dec 2026 23:59:59 GMT`

### API Standards

- ✅ **RESTful** - Follows REST principles
- ✅ **JSON** - Request/response format
- ✅ **HTTP Methods** - GET, POST, PUT, DELETE
- ✅ **Status Codes** - Standard HTTP status codes
- ✅ **CORS** - Cross-origin support
- ✅ **API Docs** - Swagger/OpenAPI at `/api-docs`

---

## 🔐 Authentication

### JWT Token-Based

All protected endpoints require JWT token in Authorization header.

```bash
Authorization: Bearer <jwt_token>
```

### Token Format

```
Header:   { "alg": "HS256", "typ": "JWT" }
Payload:  { "userId": "user123", "iat": 1622505600, "exp": 1622592000 }
Signature: HMACSHA256(base64(header) + "." + base64(payload), secret)
```

### Token Lifecycle

```
1. User registers/login
2. Server returns: { accessToken, refreshToken }
3. Client stores tokens
4. Client includes accessToken in every request
5. AccessToken expires after 24 hours
6. Client uses refreshToken to get new accessToken
7. RefreshToken expires after 30 days
```

### Authentication Endpoints

```
POST   /api/v1/auth/register      - Register new user
POST   /api/v1/auth/login         - Login user
POST   /api/v1/auth/refresh       - Refresh access token
POST   /api/v1/auth/logout        - Logout user
POST   /api/v1/auth/forgot-password - Request password reset
POST   /api/v1/auth/reset-password  - Reset password
```

---

## 📨 Request/Response Format

### Standard Request

```http
POST /api/v1/users HTTP/1.1
Host: api.velocity.dev
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
X-Request-ID: 550e8400-e29b-41d4-a716-446655440000

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

### Standard Response (Success)

```http
HTTP/1.1 201 Created
Content-Type: application/json
X-Request-ID: 550e8400-e29b-41d4-a716-446655440000

{
  "status": "success",
  "data": {
    "id": "user_123",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2026-05-30T10:00:00Z"
  },
  "meta": {
    "timestamp": "2026-05-30T10:00:00Z",
    "version": "1.0.0"
  }
}
```

### Standard Response (Error)

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json
X-Request-ID: 550e8400-e29b-41d4-a716-446655440000

{
  "status": "error",
  "code": "VALIDATION_ERROR",
  "message": "Email already exists",
  "errors": [
    {
      "field": "email",
      "message": "Email must be unique",
      "code": "UNIQUE_CONSTRAINT"
    }
  ],
  "meta": {
    "timestamp": "2026-05-30T10:00:00Z",
    "path": "/api/v1/users"
  }
}
```

---

## 🚨 Error Handling

### Error Response Format

```json
{
  "status": "error",
  "code": "ERROR_CODE",
  "message": "Human-readable error message",
  "errors": [
    {
      "field": "fieldName",
      "message": "Field-specific error",
      "code": "FIELD_ERROR_CODE"
    }
  ],
  "meta": {
    "timestamp": "2026-05-30T10:00:00Z",
    "path": "/api/v1/resource"
  }
}
```

### HTTP Status Codes & Meanings

| Code | Name                | Usage                | Example              |
| ---- | ------------------- | -------------------- | -------------------- |
| 200  | OK                  | GET successful       | Get user details     |
| 201  | Created             | POST successful      | Create new user      |
| 204  | No Content          | Success, no body     | Delete user          |
| 400  | Bad Request         | Invalid input        | Wrong data type      |
| 401  | Unauthorized        | Missing/invalid auth | No token provided    |
| 403  | Forbidden           | No permission        | User not owner       |
| 404  | Not Found           | Resource missing     | User ID not found    |
| 409  | Conflict            | Duplicate resource   | Email already exists |
| 422  | Unprocessable       | Validation failed    | Invalid email format |
| 429  | Too Many Requests   | Rate limited         | 100 req/min exceeded |
| 500  | Internal Error      | Server error         | Database down        |
| 503  | Service Unavailable | Maintenance          | Server maintenance   |

### Common Error Codes

```
VALIDATION_ERROR         - Input validation failed
AUTHENTICATION_ERROR     - Auth failed or missing
AUTHORIZATION_ERROR      - Permission denied
NOT_FOUND_ERROR         - Resource not found
CONFLICT_ERROR          - Resource conflict (duplicate)
INTERNAL_SERVER_ERROR   - Unexpected server error
DATABASE_ERROR          - Database operation failed
RATE_LIMIT_EXCEEDED     - Too many requests
INVALID_TOKEN_ERROR     - JWT token invalid/expired
```

---

## 📍 API Endpoints

### User Endpoints (8 endpoints)

```
GET    /api/v1/users                 - List all users
GET    /api/v1/users/:id             - Get user by ID
POST   /api/v1/users                 - Create user
PUT    /api/v1/users/:id             - Update user
DELETE /api/v1/users/:id             - Delete user
GET    /api/v1/users/:id/posts       - Get user's posts
GET    /api/v1/users/email/:email    - Get user by email
PATCH  /api/v1/users/:id/password    - Change password
```

### Authentication Endpoints (6 endpoints)

```
POST   /api/v1/auth/register         - Register new account
POST   /api/v1/auth/login            - Login user
POST   /api/v1/auth/logout           - Logout user
POST   /api/v1/auth/refresh          - Refresh access token
POST   /api/v1/auth/forgot-password  - Request password reset
POST   /api/v1/auth/reset-password   - Reset password
```

### Post Endpoints (8 endpoints)

```
GET    /api/v1/posts                 - List all posts
GET    /api/v1/posts/:id             - Get post by ID
POST   /api/v1/posts                 - Create post
PUT    /api/v1/posts/:id             - Update post
DELETE /api/v1/posts/:id             - Delete post
GET    /api/v1/posts/:id/comments    - Get post comments
POST   /api/v1/posts/:id/like        - Like post
DELETE /api/v1/posts/:id/like        - Unlike post
```

### Comment Endpoints (6 endpoints)

```
GET    /api/v1/comments              - List all comments
GET    /api/v1/comments/:id          - Get comment by ID
POST   /api/v1/posts/:id/comments    - Create comment
PUT    /api/v1/comments/:id          - Update comment
DELETE /api/v1/comments/:id          - Delete comment
PATCH  /api/v1/comments/:id/approve  - Approve comment
```

### Search & Discovery (6 endpoints)

```
GET    /api/v1/search                - Global search
GET    /api/v1/posts/search/text     - Search posts
GET    /api/v1/posts/trending        - Trending posts
GET    /api/v1/users/suggested       - Suggested users
GET    /api/v1/tags                  - List all tags
GET    /api/v1/tags/:id/posts        - Get posts by tag
```

### Admin Endpoints (10+ endpoints)

```
GET    /api/v1/admin/dashboard       - Admin dashboard
GET    /api/v1/admin/users           - List all users (admin)
GET    /api/v1/admin/posts           - List all posts (admin)
GET    /api/v1/admin/comments        - List all comments (admin)
DELETE /api/v1/admin/users/:id       - Delete user (admin)
DELETE /api/v1/admin/posts/:id       - Delete post (admin)
DELETE /api/v1/admin/comments/:id    - Delete comment (admin)
POST   /api/v1/admin/users/:id/suspend - Suspend user
POST   /api/v1/admin/reports         - Create report
GET    /api/v1/admin/reports         - List reports
```

### Health & Status (3 endpoints)

```
GET    /health                       - Server health check
GET    /api-docs                     - Swagger documentation
GET    /api-docs.json                - Swagger JSON schema
```

**Total**: 50+ REST endpoints

---

## 📊 Data Models

### User Model

```typescript
interface User {
  id: string; // UUID
  email: string; // Unique, lowercase
  name: string;
  password: string; // Hashed
  avatar?: string; // URL
  bio?: string;
  role: "user" | "admin"; // Default: 'user'
  status: "active" | "suspended";
  emailVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Post Model

```typescript
interface Post {
  id: string;
  userId: string; // Foreign key
  title: string;
  content: string;
  excerpt?: string;
  status: "draft" | "published" | "archived";
  likes: number;
  viewCount: number;
  commentCount: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}
```

### Comment Model

```typescript
interface Comment {
  id: string;
  postId: string; // Foreign key
  userId: string; // Foreign key
  content: string;
  likes: number;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}
```

### Authentication Response

```typescript
interface AuthResponse {
  accessToken: string; // JWT token
  refreshToken: string; // Refresh token
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}
```

---

## 🚦 Rate Limiting

### Rate Limit Rules

```
Default:           100 requests per minute per IP
Authenticated:     500 requests per minute per user
Premium:          5000 requests per minute per user
```

### Rate Limit Headers

```http
X-RateLimit-Limit:       100
X-RateLimit-Remaining:   87
X-RateLimit-Reset:       1622505660
```

### When Rate Limited

```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1622505660

{
  "status": "error",
  "code": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests, please try again later",
  "retryAfter": 60
}
```

---

## 📄 Pagination & Filtering

### Pagination Parameters

```
GET /api/v1/posts?page=2&limit=20&sort=createdAt&order=desc

query parameters:
- page: 1-based page number (default: 1)
- limit: items per page, max 100 (default: 20)
- sort: field to sort by (default: createdAt)
- order: asc | desc (default: desc)
```

### Pagination Response

```json
{
  "status": "success",
  "data": [ ... ],
  "pagination": {
    "total": 250,
    "page": 2,
    "limit": 20,
    "pages": 13,
    "hasNext": true,
    "hasPrev": true
  }
}
```

### Filtering

```
GET /api/v1/posts?status=published&userId=user123&tags=javascript,nodejs

Query filters:
- status: published | draft | archived
- userId: Filter by author
- tags: Comma-separated tag list
- createdAfter: ISO date string
- createdBefore: ISO date string
- search: Search in title/content
```

---

## 🔗 Example API Calls

### Register User

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "name": "John Doe",
    "password": "SecurePass123!"
  }'

# Response:
{
  "status": "success",
  "data": {
    "id": "user_123",
    "email": "john@example.com",
    "name": "John Doe",
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Create Post

```bash
curl -X POST http://localhost:3000/api/v1/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "My First Post",
    "content": "This is my first post...",
    "status": "published",
    "tags": ["javascript", "nodejs"]
  }'

# Response:
{
  "status": "success",
  "data": {
    "id": "post_456",
    "userId": "user_123",
    "title": "My First Post",
    "content": "This is my first post...",
    "status": "published",
    "tags": ["javascript", "nodejs"],
    "likes": 0,
    "commentCount": 0,
    "createdAt": "2026-05-30T10:00:00Z"
  }
}
```

### Get Posts with Pagination

```bash
curl "http://localhost:3000/api/v1/posts?page=1&limit=10&sort=createdAt&order=desc" \
  -H "Authorization: Bearer <token>"

# Response:
{
  "status": "success",
  "data": [ ... posts ... ],
  "pagination": {
    "total": 250,
    "page": 1,
    "limit": 10,
    "pages": 25
  }
}
```

---

## 📖 Interactive API Documentation

### Access Swagger UI

```
Development:  http://localhost:3000/api-docs
Production:   https://api.velocity.dev/api-docs
```

### Features

- ✅ Try requests directly from docs
- ✅ See request/response examples
- ✅ Download as OpenAPI JSON
- ✅ Generate client SDKs
- ✅ View schemas and models

---

**Version**: 1.0.0  
**Status**: Planning Phase - Ready for Implementation  
**Last Updated**: May 30, 2026
