/** @type {import('jest').Config} */
module.exports = {
  // Test environment
  preset: 'ts-jest',
  testEnvironment: 'node',

  // Root directory
  rootDir: '.',

  // Test file patterns
  testMatch: [
    '<rootDir>/tests/**/*.test.ts',
    '<rootDir>/tests/**/*.spec.ts',
    '<rootDir>/src/**/__tests__/**/*.ts',
  ],

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Transform files
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },

  // Module name mapping (for path aliases)
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/controllers/(.*)$': '<rootDir>/src/controllers/$1',
    '^@/services/(.*)$': '<rootDir>/src/services/$1',
    '^@/repositories/(.*)$': '<rootDir>/src/repositories/$1',
    '^@/middleware/(.*)$': '<rootDir>/src/middleware/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@/config/(.*)$': '<rootDir>/src/config/$1',
    '^@/schemas/(.*)$': '<rootDir>/src/schemas/$1',
  },

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],

  // Coverage configuration
  collectCoverage: false,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
    '!src/index.ts',
    '!src/types/**/*',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  // Test timeout
  testTimeout: 10000,

  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,

  // Verbose output
  verbose: true,

  // Error handling
  errorOnDeprecated: true,

  // Global variables
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },

  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/coverage/',
  ],

  // Watch plugins
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
};