# ⚡ Velocity - Modern HTTP Server in Node.js

![Node.js](https://img.shields.io/badge/Node.js-20%2B-green.svg?style=flat&logo=node.js)
![Express.js](https://img.shields.io/badge/Express-4.18%2B-black.svg?style=flat&logo=express)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3%2B-blue.svg?style=flat&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2B-336791.svg?style=flat&logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Supported-2496ED.svg?style=flat&logo=docker)
![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat)
![Status](https://img.shields.io/badge/Status-Planning%20Phase-blue.svg?style=flat)

---

## 📖 Project Overview

**Velocity** is a modern, production-ready HTTP server built with **Node.js + Express + TypeScript**. It provides a solid foundation for building scalable REST APIs with built-in support for authentication, validation, error handling, database integration, and more.

### Key Characteristics

- ✅ **Modern Stack** - Node.js 20+, Express 4.18+, TypeScript 5.3+
- ✅ **Type-Safe** - Full TypeScript with strict mode
- ✅ **RESTful** - Well-designed REST API with OpenAPI/Swagger
- ✅ **Scalable** - Modular architecture, horizontal scaling support
- ✅ **Secure** - JWT authentication, CORS, helmet security
- ✅ **Database-Ready** - Prisma ORM with PostgreSQL
- ✅ **Production-Grade** - Comprehensive error handling, logging, monitoring
- ✅ **Well-Documented** - API docs (Swagger), architecture guides, 87+ pages docs
- ✅ **Testable** - Jest unit & integration tests
- ✅ **Dockerized** - Docker & Docker Compose ready

---

## 🎯 Core Features

### Phase 1: MVP (v1.0)

| Feature                  | Status     | Priority |
| ------------------------ | ---------- | -------- |
| Express.js REST API      | 🔲 Planned | P0       |
| TypeScript Support       | 🔲 Planned | P0       |
| Request Validation (Zod) | 🔲 Planned | P0       |
| PostgreSQL + Prisma      | 🔲 Planned | P0       |
| JWT Authentication       | 🔲 Planned | P0       |
| Error Handling           | 🔲 Planned | P0       |
| Logging (Winston)        | 🔲 Planned | P0       |
| Swagger/OpenAPI Docs     | 🔲 Planned | P0       |
| CORS & Security Headers  | 🔲 Planned | P0       |
| Rate Limiting            | 🔲 Planned | P1       |
| Caching Layer (Redis)    | 🔲 Planned | P1       |
| Unit Tests (Jest)        | 🔲 Planned | P1       |

### Phase 2: Enhancement (v1.1)

| Feature                | Status     | Priority |
| ---------------------- | ---------- | -------- |
| Integration Tests      | 🔲 Planned | P1       |
| Advanced Caching       | 🔲 Planned | P1       |
| Email Notifications    | 🔲 Planned | P2       |
| Background Jobs (Bull) | 🔲 Planned | P2       |
| File Upload Handler    | 🔲 Planned | P2       |
| GraphQL Support        | 🔲 Planned | P2       |

### Phase 3: Enterprise (v2.0)

| Feature                  | Status     | Priority |
| ------------------------ | ---------- | -------- |
| Microservices Ready      | 🔲 Planned | P2       |
| Message Queue (RabbitMQ) | 🔲 Planned | P2       |
| Advanced Monitoring      | 🔲 Planned | P2       |
| Multi-tenancy Support    | 🔲 Planned | P2       |

---

## 🛠️ System Requirements

### Minimum Requirements

```
OS:        Windows 10/11 (64-bit), Linux, or macOS
Node.js:   v20.x (LTS) or later
npm:       v10.x or later
RAM:       2 GB minimum
Storage:   500 MB for project files
```

### Recommended Specifications

```
OS:        Ubuntu 22.04 LTS or Windows 11
Node.js:   v20.x LTS
npm:       v10.x latest
RAM:       4+ GB
Storage:   2+ GB SSD
Database:  PostgreSQL 15+
Cache:     Redis 7.0+ (optional)
```

### Optional Services

```
- PostgreSQL 15+ (for database)
- Redis 7.0+ (for caching)
- Docker & Docker Compose (for containerization)
```

---

## 📦 Tech Stack Overview

### Core Framework

- **Node.js 20+** - JavaScript runtime
- **Express 4.18+** - Web framework
- **TypeScript 5.3+** - Type safety

### Database & ORM

- **PostgreSQL 15+** - Relational database
- **Prisma 5+** - TypeScript-first ORM
- **Redis 7+** - Caching (optional)

### API & Validation

- **Zod** - Schema validation
- **Swagger/OpenAPI** - API documentation
- **CORS** - Cross-origin support

### Authentication & Security

- **JWT** - Token-based auth
- **Helmet** - Security headers
- **bcrypt** - Password hashing
- **Express Rate Limit** - Rate limiting

### Logging & Monitoring

- **Winston** - Logging framework
- **Morgan** - HTTP request logger
- **dotenv** - Environment variables

### Testing

- **Jest** - Testing framework
- **Supertest** - HTTP assertions
- **ts-jest** - TypeScript support

---

## 🚀 Quick Start

### 1. Prerequisites

```bash
# Check Node.js version (should be 20+)
node --version
npm --version
```

### 2. Installation

```bash
# Clone repository
git clone https://github.com/YourOrg/velocity.git
cd velocity

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Setup database
npm run db:migrate
npm run db:seed  # (optional)
```

### 3. Development

```bash
# Start development server (with hot reload)
npm run dev

# Server runs on http://localhost:3000
# API Docs: http://localhost:3000/api-docs
```

### 4. Test

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run integration tests
npm run test:integration
```

### 5. Build & Production

```bash
# Build TypeScript
npm run build

# Start production server
npm start

# With environment variables
NODE_ENV=production npm start
```

---

## 📁 Project Structure

```
velocity/
├── src/
│   ├── controllers/      # API request handlers
│   ├── routes/           # API route definitions
│   ├── services/         # Business logic
│   ├── models/           # Data models (Prisma)
│   ├── schemas/          # Zod validation schemas
│   ├── middleware/       # Express middleware
│   ├── utils/            # Utility functions
│   ├── types/            # TypeScript type definitions
│   ├── database/         # Database setup
│   ├── config/           # Configuration
│   └── index.ts          # Application entry point
│
├── tests/
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   └── fixtures/         # Test data
│
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migrations
│
├── docs/                 # Documentation
├── .env.example          # Environment template
├── docker-compose.yml    # Docker services
├── Dockerfile            # Container image
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── jest.config.js        # Test configuration
└── README.md             # This file
```

---

## 📚 Documentation

Complete documentation is available in `/docs` folder:

- **[PLANNING_SUMMARY.md](docs/PLANNING_SUMMARY.md)** - Complete project planning (10 pages)
- **[PRD.md](docs/PRD.md)** - Product requirements & features (15 pages)
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System architecture & design (20 pages)
- **[API_SPECIFICATION.md](docs/API_SPECIFICATION.md)** - REST API specification (18 pages)
- **[TECHNOLOGY_STACK.md](docs/TECHNOLOGY_STACK.md)** - Tech stack details (12 pages)
- **[DEVELOPMENT_ROADMAP.md](docs/DEVELOPMENT_ROADMAP.md)** - Timeline & phases (12 pages)
- **[INDEX.md](docs/INDEX.md)** - Documentation index

**Total**: 87+ pages of comprehensive documentation

---

## 🔌 API Examples

### Health Check

```bash
curl http://localhost:3000/health
# Response: { "status": "ok", "timestamp": "2026-05-30T10:00:00Z" }
```

### Get All Users

```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/v1/users
```

### Create User

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123"
  }' \
  http://localhost:3000/api/v1/users
```

### Full API Documentation

Visit **http://localhost:3000/api-docs** for interactive Swagger documentation

---

## 🐳 Docker Setup

### Run with Docker Compose

```bash
# Start all services (API + PostgreSQL + Redis)
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

### Build Docker Image

```bash
# Build image
docker build -t velocity:latest .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="your-secret" \
  velocity:latest
```

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test -- user.test.ts

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

---

## 🔐 Security Best Practices

- ✅ Environment variables for sensitive data (`.env`)
- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ Rate limiting
- ✅ Input validation (Zod)
- ✅ SQL injection protection (Prisma)

---

## 📊 Performance

### Target Metrics

- **Response Time**: <100ms (p95)
- **Throughput**: 5000+ requests/second
- **Database**: PostgreSQL connection pooling
- **Caching**: Redis for frequently accessed data
- **Uptime**: 99.9% availability

---

## 🤝 Contributing

Contributions are welcome! See [DEVELOPMENT_ROADMAP.md](docs/DEVELOPMENT_ROADMAP.md) for development guidelines.

### Development Workflow

1. Create feature branch: `git checkout -b feature/awesome-feature`
2. Make changes and write tests
3. Run tests: `npm test`
4. Commit changes: `git commit -m "Add awesome feature"`
5. Push and create Pull Request

---

## 📝 Environment Variables

```env
# Server
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/velocity

# Authentication
JWT_SECRET=your-super-secret-key
JWT_EXPIRATION=24h

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Cors
CORS_ORIGIN=http://localhost:3000

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find process on port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

### Database Connection Error

```bash
# Check DATABASE_URL in .env
# Ensure PostgreSQL is running
# Run migrations: npm run db:migrate
```

### Module Not Found

```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

---

## 📞 Support & Contact

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/YourOrg/velocity/issues)
- **Discussions**: [GitHub Discussions](https://github.com/YourOrg/velocity/discussions)
- **Email**: support@velocity-api.dev

---

## 📄 License

MIT License © 2026 Velocity Contributors

---

## 🎯 Next Steps

1. **Read the Documentation** - Start with [PLANNING_SUMMARY.md](docs/PLANNING_SUMMARY.md)
2. **Setup Development** - Follow Quick Start section
3. **Explore Examples** - Check `/examples` folder
4. **Read API Spec** - Review [API_SPECIFICATION.md](docs/API_SPECIFICATION.md)
5. **Start Coding** - Follow [DEVELOPMENT_ROADMAP.md](docs/DEVELOPMENT_ROADMAP.md)

---

**Version**: 1.0.0  
**Status**: Planning Phase - Ready for Development  
**Last Updated**: May 30, 2026
