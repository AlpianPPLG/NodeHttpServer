/**
 * Environment configuration
 * Validates and exports environment variables
 */

import { config as dotenvConfig } from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenvConfig();

// Environment validation schema
const envSchema = z.object({
  // Server
  NODE_ENV: z
    .string()
    .optional()
    .transform(val => {
      if (!val || val === 'C:\\Program Files\\nodejs') return 'development';
      return val;
    })
    .pipe(z.enum(['development', 'production', 'test']))
    .default('development'),
  PORT: z
    .string()
    .optional()
    .transform(val => (val ? Number(val) : 3000))
    .default('3000'),
  API_VERSION: z.string().default('v1'),

  // Database
  DATABASE_URL: z.string().optional().default(''),

  // Authentication
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRATION: z.string().default('24h'),
  JWT_REFRESH_EXPIRATION: z.string().default('30d'),

  // Redis (optional)
  REDIS_URL: z.string().optional(),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z
    .string()
    .optional()
    .transform(val => (val ? Number(val) : 0))
    .default('0'),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  CORS_CREDENTIALS: z
    .string()
    .optional()
    .transform(val => val === 'true')
    .default('true'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FORMAT: z.enum(['json', 'simple']).default('json'),
  LOG_FILE_ENABLED: z
    .string()
    .optional()
    .transform(val => val === 'true')
    .default('true'),
  LOG_FILE_PATH: z.string().default('./logs/app.log'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z
    .string()
    .optional()
    .transform(val => (val ? Number(val) : 900000))
    .default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z
    .string()
    .optional()
    .transform(val => (val ? Number(val) : 100))
    .default('100'),

  // Security
  BCRYPT_ROUNDS: z
    .string()
    .optional()
    .transform(val => (val ? Number(val) : 12))
    .default('12'),
  SESSION_SECRET: z.string().optional(),

  // API Documentation
  SWAGGER_ENABLED: z
    .string()
    .optional()
    .transform(val => val === 'true')
    .default('true'),
  SWAGGER_PATH: z.string().default('/api-docs'),

  // Health & Monitoring
  HEALTH_CHECK_ENABLED: z
    .string()
    .optional()
    .transform(val => val === 'true')
    .default('true'),
  METRICS_ENABLED: z
    .string()
    .optional()
    .transform(val => val === 'true')
    .default('true'),

  // Email (optional)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z
    .string()
    .optional()
    .transform(val => (val ? Number(val) : undefined)),
  SMTP_SECURE: z
    .string()
    .optional()
    .transform(val => val === 'true'),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().optional(),

  // File Upload
  UPLOAD_MAX_SIZE: z
    .string()
    .optional()
    .transform(val => (val ? Number(val) : 10485760))
    .default('10485760'), // 10MB
  UPLOAD_ALLOWED_TYPES: z
    .string()
    .default('image/jpeg,image/png,image/gif,application/pdf'),
  UPLOAD_DEST: z.string().default('./uploads'),

  // Development
  DEBUG: z.string().optional(),
  MOCK_EMAIL: z
    .string()
    .optional()
    .transform(val => val === 'true')
    .default('false'),
});

// Validate environment variables
const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parseResult.error.format());
  process.exit(1);
}

export const env = parseResult.data;

// Derived configurations
export const config = {
  // Server
  server: {
    port: env.PORT,
    env: env.NODE_ENV,
    apiVersion: env.API_VERSION,
    isDevelopment: env.NODE_ENV === 'development',
    isProduction: env.NODE_ENV === 'production',
    isTest: env.NODE_ENV === 'test',
  },

  // Database
  database: {
    url: env.DATABASE_URL,
  },

  // Authentication
  auth: {
    jwtSecret: env.JWT_SECRET,
    jwtExpiration: env.JWT_EXPIRATION,
    jwtRefreshExpiration: env.JWT_REFRESH_EXPIRATION,
    bcryptRounds: env.BCRYPT_ROUNDS,
  },

  // Redis
  redis: {
    url: env.REDIS_URL,
    password: env.REDIS_PASSWORD,
    db: env.REDIS_DB,
    enabled: Boolean(env.REDIS_URL),
  },

  // CORS
  cors: {
    origin: env.CORS_ORIGIN.split(',').map(origin => origin.trim()),
    credentials: env.CORS_CREDENTIALS,
  },

  // Logging
  logging: {
    level: env.LOG_LEVEL,
    format: env.LOG_FORMAT,
    fileEnabled: env.LOG_FILE_ENABLED,
    filePath: env.LOG_FILE_PATH,
  },

  // Rate Limiting
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  },

  // API Documentation
  swagger: {
    enabled: env.SWAGGER_ENABLED,
    path: env.SWAGGER_PATH,
  },

  // Health Check
  health: {
    enabled: env.HEALTH_CHECK_ENABLED,
    metricsEnabled: env.METRICS_ENABLED,
  },

  // Email
  email: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
    from: env.EMAIL_FROM,
    mock: env.MOCK_EMAIL,
    enabled: Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS),
  },

  // File Upload
  upload: {
    maxSize: env.UPLOAD_MAX_SIZE,
    allowedTypes: env.UPLOAD_ALLOWED_TYPES.split(',').map(type => type.trim()),
    destination: env.UPLOAD_DEST,
  },
} as const;

export default config;
