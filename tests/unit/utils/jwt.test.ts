/**
 * Unit tests for JWT utilities
 */

import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  extractTokenFromHeader,
  isTokenExpired,
  getTokenExpirationTime,
} from '../../../src/utils/jwt';
import { AuthUser } from '../../../src/types/auth.types';

const mockUser: AuthUser = {
  id: 'user_1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'USER',
  emailVerified: false,
};

describe('JWT Utilities', () => {
  describe('generateAccessToken', () => {
    it('should generate a valid JWT string', () => {
      const token = generateAccessToken(mockUser);
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const token = generateRefreshToken(mockUser);
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid access token', () => {
      const token = generateAccessToken(mockUser);
      const payload = verifyToken(token);
      expect(payload.userId).toBe(mockUser.id);
      expect(payload.email).toBe(mockUser.email);
      expect(payload.type).toBe('access');
    });

    it('should verify a valid refresh token', () => {
      const token = generateRefreshToken(mockUser);
      const payload = verifyToken(token);
      expect(payload.userId).toBe(mockUser.id);
      expect(payload.type).toBe('refresh');
    });

    it('should throw for an invalid token', () => {
      expect(() => verifyToken('invalid.token.here')).toThrow();
    });

    it('should throw for a tampered token', () => {
      const token = generateAccessToken(mockUser);
      expect(() => verifyToken(token + 'tampered')).toThrow();
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from valid Bearer header', () => {
      const token = generateAccessToken(mockUser);
      const extracted = extractTokenFromHeader(`Bearer ${token}`);
      expect(extracted).toBe(token);
    });

    it('should throw when header is missing', () => {
      expect(() => extractTokenFromHeader(undefined)).toThrow('Authorization header missing');
    });

    it('should throw when format is invalid', () => {
      expect(() => extractTokenFromHeader('Token abc123')).toThrow('Invalid authorization format');
    });
  });

  describe('isTokenExpired', () => {
    it('should return false for a fresh token', () => {
      const token = generateAccessToken(mockUser);
      expect(isTokenExpired(token)).toBe(false);
    });

    it('should return true for a completely invalid token', () => {
      expect(isTokenExpired('not.a.token')).toBe(true);
    });
  });

  describe('getTokenExpirationTime', () => {
    it('should return a positive number of seconds', () => {
      const seconds = getTokenExpirationTime();
      expect(seconds).toBeGreaterThan(0);
    });
  });
});
