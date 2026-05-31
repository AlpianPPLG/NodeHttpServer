# Brainstorm Plan - Next Milestone (Foundation → API surfaces)

## Goal
Turn the existing Express/TS foundation into a working “v1 API” skeleton that matches the documentation vision:
- Swagger/OpenAPI at `/api-docs`
- Base API routing under `/api/v1`
- Prisma schema + Prisma client wiring (at least `User`)
- Database-aware health checks
- Scaffold authentication + users endpoints (stubs → incremental implementation)

## Observations from current repo
- `/health` is implemented.
- `src/app.ts` already composes security/logging/error middleware and mounts `routes` from `src/routes/index.ts`.
- `src/routes/index.ts` mounts `/health` and mounts `/api/:apiVersion` but the API router is currently empty.
- Swagger is mentioned in config (`SWAGGER_ENABLED`, `SWAGGER_PATH`) but not implemented in `src/app.ts`.
- `prisma/` contains only `.gitkeep` (no `schema.prisma` in repo right now).
- Error handling middleware exists and supports `AppError` and `ZodError`.

## Milestone breakdown

### 1) Swagger/OpenAPI plumbing
**Files likely affected**
- `src/app.ts`
- add new `src/routes/swagger.routes.ts` (or similar)
- add `src/config/swagger.ts` (optional)

**Approach**
- Use `swagger-jsdoc` + `swagger-ui-express` already present in dependencies.
- Configure JSDoc scan paths: `src/routes/**/*.ts`, `src/controllers/**/*.ts`.
- Mount:
  - `GET /api-docs` → Swagger UI
  - `GET /api-docs.json` → OpenAPI JSON

**Result**
- `/api-docs` works when `config.swagger.enabled === true`.

### 2) `/api/v1` router skeleton
**Files likely affected**
- `src/routes/index.ts`
- add `src/routes/api/v1/*.routes.ts` OR keep under `src/routes/` with names like `auth.routes.ts`, `users.routes.ts`

**Approach**
- Create an `apiRouter` and mount modules with URL prefixes:
  - `/auth`
  - `/users`
  - `/posts`
  - `/comments`
  - (later) `/search`, `/tags`, `/admin`
- For now, wire health only + placeholder routers that return 501/NOT_IMPLEMENTED.

**Result**
- Requests to `/api/v1/...` start returning consistent structured errors instead of 404.

### 3) Prisma foundation + database-aware health
**Files likely affected**
- `prisma/schema.prisma` (create)
- `src/database/prismaClient.ts` (create)
- `src/database/index.ts` (if needed)
- `src/controllers/health.controller.ts` (enhance)

**Approach**
- Create `schema.prisma` with models starting from documented `User`, possibly `UserSession`.
- Use env `DATABASE_URL`.
- Create singleton Prisma client to avoid connection storms in dev.
- Update `/health/detailed` to attempt:
  - `prisma.$queryRaw` or `prisma.$connect()`/a simple query

**Result**
- Health reflects real database status when Prisma is configured.

### 4) Scaffold auth + users endpoints (incremental)
**Files likely affected**
- `src/routes/auth.routes.ts`
- `src/controllers/auth.controller.ts`
- `src/services/auth.service.ts`
- `src/repositories/auth.repository.ts`
- plus similar structure for users.
- `src/types/*` for request typing if needed

**Approach**
- First implement minimal endpoints matching docs:
  - `POST /api/v1/auth/register`
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/refresh`
  - `GET /api/v1/users` and `GET /api/v1/users/:id`
- Use existing error handling (`AppError`) and `Zod` for request validation.
- Password hashing via `bcryptjs` (already installed).
- JWT via `jsonwebtoken`.

**Incremental delivery**
1. Create routes/controllers returning “not implemented” but correctly formatted.
2. Implement register + login end-to-end.
3. Add list/get users.

### 5) Tests scaffolding
**Files likely affected**
- `tests/integration/*`
- `tests/unit/*`
- `tests/setup.ts`

**Approach**
- Add integration tests using Supertest against `createApp()` (or create an exported app instance for tests).
- Start with:
  - `/health` returns 200
  - `/api/v1/users` returns 501 or 404 depending on skeleton stage
  - Once auth/users are implemented: test register + login happy path.

## Risks / gaps
- `prisma/schema.prisma` is missing → must create from docs.
- `src/routes/index.ts` currently has TODOs for api modules.
- Swagger needs JSDoc tags aligned with existing error/response format.

## Acceptance criteria (end of milestone)
- `npm run dev` starts and:
  - `GET /health` works
  - `GET /api-docs` works (when enabled)
  - `/api/v1` responds with a consistent skeleton (no missing imports)
- Prisma client can connect and health updates when DB is available.
- Auth/register + auth/login work at least in “happy path” with tests.
