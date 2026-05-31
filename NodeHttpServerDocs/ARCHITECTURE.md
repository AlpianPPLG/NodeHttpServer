# 🏗️ System Architecture & Design

**Velocity** menggunakan **layered architecture** yang memisahkan concerns dan memfasilitasi modularitas, testability, dan extensibility.

---

## 📖 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Component Architecture](#component-architecture)
3. [Data Flow](#data-flow)
4. [Module Design](#module-design)
5. [Design Patterns](#design-patterns)
6. [Dependency Graph](#dependency-graph)
7. [Error Handling Strategy](#error-handling-strategy)
8. [Scalability & Performance](#scalability--performance)

---

## 🎯 Architecture Overview

### High-Level Layered Architecture

```
┌──────────────────────────────────────────────────────┐
│                 Presentation Layer                    │
│  ┌──────────────────┐  ┌──────────────────────────┐ │
│  │  HTTP Routes     │  │  Swagger/OpenAPI         │ │
│  │  (Express)       │  │  Documentation           │ │
│  └────────┬─────────┘  └──────────────┬───────────┘ │
└──────────┼──────────────────────────┼────────────────┘
           │                          │
┌──────────┴──────────────────────────┴────────────────┐
│               Controller Layer                       │
│  ┌────────────────────────────────────────────────┐ │
│  │  UserController    PostController              │ │
│  │  AuthController    CommentController           │ │
│  └────────────────────────────────────────────────┘ │
└──────────┬────────────────────────────────────────────┘
           │
┌──────────┴────────────────────────────────────────────┐
│             Middleware Layer                         │
│  ┌────────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │ Auth       │  │ Validation   │  │ Error       │  │
│  │ middleware │  │ middleware   │  │ Handler     │  │
│  └────────────┘  └──────────────┘  └─────────────┘  │
└──────────┬────────────────────────────────────────────┘
           │
┌──────────┴────────────────────────────────────────────┐
│            Business Logic Layer (Services)           │
│  ┌────────────────────────────────────────────────┐ │
│  │  UserService   PostService   AuthService       │ │
│  │  CommentService  EmailService                  │ │
│  └────────────────────────────────────────────────┘ │
└──────────┬────────────────────────────────────────────┘
           │
┌──────────┴────────────────────────────────────────────┐
│         Data Access Layer (Repository/ORM)          │
│  ┌────────────────────────────────────────────────┐ │
│  │  Prisma ORM                                    │ │
│  │  - UserRepository                             │ │
│  │  - PostRepository                             │ │
│  │  - CommentRepository                          │ │
│  └────────────────────────────────────────────────┘ │
└──────────┬────────────────────────────────────────────┘
           │
┌──────────┴────────────────────────────────────────────┐
│               Data Layer                             │
│  ┌────────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │ PostgreSQL │  │ Redis    │  │ File Storage     │ │
│  │ Database   │  │ Cache    │  │ (S3/Local)       │ │
│  └────────────┘  └──────────┘  └──────────────────┘ │
└──────────────────────────────────────────────────────┘
```

### Architecture Principles

1. **Separation of Concerns** - Each layer has distinct responsibility
2. **Dependency Inversion** - Depend on abstractions, not implementations
3. **Don't Repeat Yourself (DRY)** - Reuse components, avoid duplication
4. **Single Responsibility** - Each class/module does one thing well
5. **Open/Closed Principle** - Open for extension, closed for modification
6. **Interface Segregation** - Specific interfaces for different clients
7. **Composition over Inheritance** - Prefer composition patterns

---

## 🧩 Component Architecture

### Component Diagram

```
┌──────────────────────────────────────────────────────────┐
│                    Velocity Server                       │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────┐         ┌──────────────────────┐ │
│  │  HTTP Router     │◄────────┤  Express App         │ │
│  │                  │         │                      │ │
│  └──────────────────┘         └──────┬───────────────┘ │
│        │                             │                 │
│        ▼                             ▼                 │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Middleware Stack                         │  │
│  │  ├─ Auth Middleware (JWT)                        │  │
│  │  ├─ Validation Middleware (Zod)                  │  │
│  │  ├─ Error Handler Middleware                     │  │
│  │  ├─ CORS Middleware                              │  │
│  │  ├─ Rate Limiter Middleware                      │  │
│  │  ├─ Logging Middleware (Morgan/Winston)          │  │
│  │  └─ Compression Middleware                       │  │
│  └──────────────────┬───────────────────────────────┘  │
│                     │                                  │
│        ┌────────────┼────────────┬─────────────────┐   │
│        ▼            ▼            ▼                 ▼   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐  ┌────────────┐
│  │ User     │ │ Post     │ │ Comment  │  │ Auth       │
│  │Controller│ │Controller│ │Controller│  │ Controller │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘  └──────┬─────┘
│       │            │             │               │     │
│       │            ▼             ▼               ▼     │
│       │     ┌─────────────────────────────────────┐   │
│       │     │      Service Layer                  │   │
│       │     │  ┌──────────────────────────────┐  │   │
│       │     │  │ UserService                  │  │   │
│       │     │  │ PostService                  │  │   │
│       │     │  │ CommentService               │  │   │
│       │     │  │ AuthService                  │  │   │
│       │     │  │ EmailService                 │  │   │
│       │     │  └──────────────────────────────┘  │   │
│       │     └────────────┬──────────────────────┘   │
│       │                  │                         │   │
│       │                  ▼                         │   │
│       │     ┌────────────────────────────────────┐   │
│       │     │   Repository Layer (Prisma ORM)   │   │
│       │     │  ├─ UserRepository                │   │
│       │     │  ├─ PostRepository                │   │
│       │     │  ├─ CommentRepository             │   │
│       │     │  └─ Query Builder                 │   │
│       │     └────────────┬──────────────────────┘   │
│       │                  │                         │   │
│       └──────────────────┼─────────────────────────┘   │
│                          │                             │
│        ┌─────────────────┼──────────────────┐         │
│        ▼                 ▼                  ▼         │
│  ┌──────────────┐ ┌───────────┐  ┌─────────────────┐ │
│  │ PostgreSQL   │ │ Redis     │  │ File Storage    │ │
│  │ Database     │ │ Cache     │  │ (S3/Local)      │ │
│  └──────────────┘ └───────────┘  └─────────────────┘ │
│                                                       │
└──────────────────────────────────────────────────────┘
```

### Key Components

| Component       | Responsibility           | Technology          |
| --------------- | ------------------------ | ------------------- |
| **Router**      | URL routing & mapping    | Express Router      |
| **Controllers** | Request handling         | Express Controllers |
| **Middleware**  | Request processing       | Express Middleware  |
| **Services**    | Business logic           | Custom TypeScript   |
| **Repository**  | Data access              | Prisma ORM          |
| **Database**    | Data persistence         | PostgreSQL          |
| **Cache**       | Performance optimization | Redis (optional)    |

---

## 🔄 Data Flow

### Request-Response Flow

```
Client Request
    │
    ▼
┌─────────────────────────┐
│  HTTP Route Matching    │  Express routing
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Middleware Stack        │  Auth, validation, logging
├─ Auth Middleware       │
├─ Validation Middleware │
├─ Logging Middleware    │
└────────┬────────────────┘
         │
         ▼ (if all pass)
┌─────────────────────────┐
│ Controller Handler      │  Extract data, call service
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Service Layer           │  Business logic & validation
│ - Validate input        │
│ - Apply business rules  │
│ - Call repository       │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Repository/ORM          │  Database query
│ - Fetch/update data     │
│ - Return data objects   │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Database               │  PostgreSQL operation
└────────┬────────────────┘
         │
         ▼ (response flows back)
┌─────────────────────────┐
│ Service Response        │  Format response
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Controller Formatting   │  JSON formatting
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ HTTP Response           │  Status code + body
└────────┬────────────────┘
         │
         ▼
    Client Response
```

### Example: Create Post Request

```
1. POST /api/v1/posts HTTP/1.1
   Content-Type: application/json
   Authorization: Bearer <token>

   { "title": "Hello", "content": "World" }

2. Route → POST /api/v1/posts
   Handler → postController.createPost()

3. Middleware checks:
   - Auth: Valid JWT token? ✅
   - Validation: Valid schema? ✅
   - Rate limit: Under limit? ✅

4. Controller:
   - Extract: { title, content, userId }
   - Validate permission ✅
   - Call: postService.create()

5. Service:
   - Validate business rules ✅
   - Check ownership ✅
   - Call: postRepository.create()

6. Repository:
   - Prisma.post.create({ ... })
   - Database INSERT

7. Response:
   - 201 Created
   - { id, title, content, createdAt, author }
```

---

## 🏛️ Module Design

### Module Organization

```
src/
├── controllers/
│   ├── auth.controller.ts       # Auth endpoints
│   ├── user.controller.ts       # User endpoints
│   ├── post.controller.ts       # Post endpoints
│   └── comment.controller.ts    # Comment endpoints
│
├── routes/
│   ├── auth.routes.ts           # /api/v1/auth
│   ├── user.routes.ts           # /api/v1/users
│   ├── post.routes.ts           # /api/v1/posts
│   └── index.ts                 # Route aggregation
│
├── services/
│   ├── auth.service.ts          # Auth business logic
│   ├── user.service.ts          # User logic
│   ├── post.service.ts          # Post logic
│   ├── comment.service.ts       # Comment logic
│   ├── email.service.ts         # Email sending
│   └── cache.service.ts         # Caching layer
│
├── repositories/
│   ├── user.repository.ts       # User data access
│   ├── post.repository.ts       # Post data access
│   └── comment.repository.ts    # Comment data access
│
├── middleware/
│   ├── auth.middleware.ts       # JWT verification
│   ├── validation.middleware.ts # Schema validation
│   ├── errorHandler.ts          # Error handling
│   ├── logging.middleware.ts    # Request logging
│   └── rateLimiter.ts           # Rate limiting
│
├── schemas/
│   ├── auth.schema.ts           # Auth validation
│   ├── user.schema.ts           # User validation
│   ├── post.schema.ts           # Post validation
│   └── comment.schema.ts        # Comment validation
│
├── types/
│   ├── api.types.ts             # API types
│   ├── models.types.ts          # Database models
│   ├── error.types.ts           # Error types
│   └── index.ts                 # Type exports
│
├── utils/
│   ├── logger.ts                # Logging setup
│   ├── jwt.ts                   # JWT utilities
│   ├── password.ts              # Password hashing
│   ├── validators.ts            # Validation helpers
│   └── decorators.ts            # TS decorators
│
├── config/
│   ├── database.ts              # Database config
│   ├── env.ts                   # Environment config
│   ├── security.ts              # Security config
│   └── constants.ts             # App constants
│
├── database/
│   ├── index.ts                 # Prisma client
│   └── seed.ts                  # Database seeding
│
└── index.ts                     # App entry point
```

### Controller Example

```typescript
// controllers/user.controller.ts

import { Request, Response, NextFunction } from "express";
import { userService } from "../services/user.service";
import { CreateUserSchema } from "../schemas/user.schema";

export class UserController {
  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userService.getAllUsers();
      res.json(users);
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);
      if (!user) return res.status(404).json({ error: "Not found" });
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const data = CreateUserSchema.parse(req.body);
      const user = await userService.createUser(data);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }
}
```

### Service Example

```typescript
// services/user.service.ts

import { userRepository } from "../repositories/user.repository";
import { hashPassword, comparePassword } from "../utils/password";

export class UserService {
  async getAllUsers() {
    return userRepository.findAll();
  }

  async getUserById(id: string) {
    return userRepository.findById(id);
  }

  async createUser(data: CreateUserInput) {
    // Validate unique email
    const existing = await userRepository.findByEmail(data.email);
    if (existing) throw new Error("Email already exists");

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user
    return userRepository.create({
      ...data,
      password: hashedPassword,
    });
  }

  async updateUser(id: string, data: UpdateUserInput) {
    return userRepository.update(id, data);
  }

  async deleteUser(id: string) {
    return userRepository.delete(id);
  }
}
```

---

## 🎨 Design Patterns

### 1. **Dependency Injection Pattern**

```typescript
// Service receives dependencies via constructor
class UserService {
  constructor(
    private userRepository: UserRepository,
    private emailService: EmailService,
  ) {}

  async createUser(data: any) {
    const user = await this.userRepository.create(data);
    await this.emailService.sendWelcomeEmail(user.email);
    return user;
  }
}
```

### 2. **Repository Pattern**

```typescript
// Abstract data access layer
interface IUserRepository {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  create(data: CreateUserInput): Promise<User>;
  update(id: string, data: UpdateUserInput): Promise<User>;
  delete(id: string): Promise<void>;
}

class UserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll() {
    return this.prisma.user.findMany();
  }
  // ... other methods
}
```

### 3. **Middleware Pattern**

```typescript
// Express middleware for cross-cutting concerns
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    (req as any).userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Apply to route
app.get("/api/v1/posts", authMiddleware, postController.getPosts);
```

### 4. **Strategy Pattern**

```typescript
// Different validation strategies
interface ValidationStrategy {
  validate(data: any): boolean;
}

class EmailValidationStrategy implements ValidationStrategy {
  validate(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}

class PasswordValidationStrategy implements ValidationStrategy {
  validate(password: string) {
    return password.length >= 8;
  }
}
```

### 5. **Factory Pattern**

```typescript
// Create different types of responses
class ResponseFactory {
  static success(data: any, message = "Success") {
    return { status: "success", data, message };
  }

  static error(error: string, code = 400) {
    return { status: "error", error, code };
  }

  static paginated(data: any[], total: number, page: number, limit: number) {
    return {
      status: "success",
      data,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    };
  }
}
```

---

## 📦 Dependency Graph

### Core Dependencies

```
Express.js
├── typescript (development)
├── ts-node (development)
└── @types/express

Prisma
├── @prisma/client (runtime)
└── prisma (CLI)

JWT
├── jsonwebtoken
└── @types/jsonwebtoken

Security
├── bcryptjs
├── helmet
├── cors
└── express-rate-limit

Validation
├── zod
└── axios

Logging
├── winston
├── morgan
└── @types/morgan

Testing
├── jest
├── ts-jest
├── supertest
└── @types/jest
```

### Import Dependencies Example

```
main.ts
├── config/env
├── config/database
├── routes/
│   ├── auth.routes (depends on: auth.controller)
│   ├── user.routes (depends on: user.controller)
│   └── post.routes (depends on: post.controller)
└── middleware/ (depends on: express, jsonwebtoken, zod)

routes/user.routes
└── controllers/user.controller
    └── services/user.service
        └── repositories/user.repository
            └── prisma/database
```

---

## 🚨 Error Handling Strategy

### Error Hierarchy

```typescript
// Custom error classes
class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code: string = "INTERNAL_ERROR",
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, "VALIDATION_ERROR");
  }
}

class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404, "NOT_FOUND");
  }
}

class UnauthorizedError extends AppError {
  constructor(message: string) {
    super(message, 401, "UNAUTHORIZED");
  }
}

class ForbiddenError extends AppError {
  constructor(message: string) {
    super(message, 403, "FORBIDDEN");
  }
}

class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, "CONFLICT");
  }
}
```

### Error Handling Middleware

```typescript
// Global error handler (last middleware)
const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const status = error.statusCode || 500;
  const message = error.message || "Internal server error";
  const code = error.code || "INTERNAL_ERROR";

  logger.error({
    message,
    code,
    status,
    path: req.path,
    method: req.method,
    stack: error.stack,
  });

  res.status(status).json({
    status: "error",
    code,
    message,
    timestamp: new Date().toISOString(),
    path: req.path,
  });
};

// Apply middleware
app.use(errorHandler);
```

### HTTP Status Codes

| Code | Meaning             | Use Case             |
| ---- | ------------------- | -------------------- |
| 200  | OK                  | Successful request   |
| 201  | Created             | Resource created     |
| 204  | No Content          | Success, no body     |
| 400  | Bad Request         | Invalid input        |
| 401  | Unauthorized        | Missing/invalid auth |
| 403  | Forbidden           | No permission        |
| 404  | Not Found           | Resource not found   |
| 409  | Conflict            | Duplicate resource   |
| 422  | Unprocessable       | Validation error     |
| 429  | Too Many Requests   | Rate limited         |
| 500  | Internal Error      | Server error         |
| 503  | Service Unavailable | Maintenance mode     |

---

## 📈 Scalability & Performance

### Horizontal Scaling

```
Client Requests
    │
    ▼
┌─────────────────┐
│  Load Balancer  │  (Nginx, HAProxy)
└────────┬────────┘
    ┌───┴────┬──────┬─────────┐
    │        │      │         │
    ▼        ▼      ▼         ▼
┌─────────┐┌──────┐┌──────┐┌─────────┐
│Instance ││Inst. ││Inst. ││Instance │
│   #1    │  #2  │  #3  │   #4    │
│ (API)   │(API) │(API) │ (API)   │
└────┬────┘└──┬───┘└──┬──┘└────┬────┘
     │        │      │        │
     └────────┼──────┼────────┘
              │      │
              ▼      ▼
         ┌──────────────┐
         │   PostgreSQL │  (Single DB or replicated)
         │   Database   │
         └──────────────┘
```

### Caching Strategy

```
Request
  │
  ├─→ Check Redis Cache? ✓
  │   (Key: user:123)
  ├─→ Hit? Return cached data
  │
  └─→ Miss? Query Database
      │
      └─→ Cache result in Redis (TTL: 1 hour)
          │
          └─→ Return to client
```

### Performance Optimization

1. **Database**
   - Connection pooling (via Prisma)
   - Query optimization (indexes)
   - Select only needed fields
   - Pagination for large result sets

2. **Caching**
   - Redis for frequently accessed data
   - Invalidate cache on updates
   - TTL-based expiration

3. **HTTP**
   - Response compression (gzip)
   - ETag for client caching
   - Conditional requests (If-Modified-Since)

4. **Application**
   - Async operations (non-blocking)
   - Connection pooling
   - Rate limiting to prevent abuse

---

**Version**: 1.0.0  
**Status**: Planning Phase - Ready for Implementation  
**Last Updated**: May 30, 2026
