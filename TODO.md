# TODO - NodeHttpServer (Velocity)

> Tracks implementation steps from the approved plan.

## 0. Repo understanding
- [x] Read project structure (root, src, tests)
- [x] Read documentation (NodeHttpServerDocs)
- [x] Read current Express/TS foundation (app.ts, middleware, health)

## 1. Swagger + baseline routing
- [x] Add Swagger routes (`src/routes/swagger.routes.ts`)
- [x] Wire Swagger into routes aggregator (`src/routes/index.ts`)

## 2. /api/v1 skeleton
- [x] Add v1 route aggregator (`src/routes/api-v1/index.ts`)
- [x] Add placeholder controllers for auth (`src/controllers/auth.controller.ts`)
- [x] Add placeholder controllers for users (`src/controllers/users.controller.ts`)
- [x] Add placeholder auth routes (`src/routes/api-v1/auth.routes.ts`)
- [x] Add placeholder users routes (`src/routes/api-v1/users.routes.ts`)
- [x] Mount v1 routes under `/api/v1` (`src/routes/index.ts`)
- [ ] Validate runtime: `/api-docs*` works
- [ ] Validate runtime: `/api/v1/users` returns 503 (placeholder)

## 3. Next milestones (not started)
- [ ] Implement health under `/api/v1/health` or keep only `/health`
- [ ] Add Zod validation + typed request/response patterns
- [ ] Add error code mapping improvements
- [ ] Add Jest unit/integration tests

## 4. Runtime verification (approved step)
- [ ] Start server + verify `GET /health` returns 200
- [ ] Verify `GET /api-docs` returns 200 (when enabled)
- [ ] Verify `GET /api/v1/users` returns structured 503 (stub)

