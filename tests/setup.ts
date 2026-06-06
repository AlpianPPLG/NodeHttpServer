/**
 * Jest global test setup
 */

// Set test environment variables before anything else
process.env.NODE_ENV = 'test';
process.env.PORT = '3002';
process.env.JWT_SECRET = 'test-secret-key-that-is-at-least-32-characters-long';
process.env.JWT_EXPIRATION = '1h';
process.env.JWT_REFRESH_EXPIRATION = '7d';
process.env.LOG_LEVEL = 'error'; // Suppress logs during tests
process.env.SWAGGER_ENABLED = 'false';

// Increase timeout for async tests
jest.setTimeout(10000);
