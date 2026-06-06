/**
 * Unit tests for AuthService
 */

import { authService } from '../../../src/services/auth.service';

describe('AuthService', () => {
  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = 'TestPass123!';
  let accessToken: string;
  let refreshToken: string;
  let userId: string;

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const result = await authService.register({
        name: 'Test User',
        email: testEmail,
        password: testPassword,
        confirmPassword: testPassword,
      });

      expect(result.user.email).toBe(testEmail);
      expect(result.user.name).toBe('Test User');
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();

      accessToken = result.accessToken;
      refreshToken = result.refreshToken;
      userId = result.user.id;
    });

    it('should reject duplicate email', async () => {
      await expect(
        authService.register({
          name: 'Another User',
          email: testEmail,
          password: testPassword,
          confirmPassword: testPassword,
        })
      ).rejects.toThrow('Email already registered');
    });

    it('should reject mismatched passwords', async () => {
      await expect(
        authService.register({
          name: 'User',
          email: `unique_${Date.now()}@example.com`,
          password: testPassword,
          confirmPassword: 'DifferentPass123!',
        })
      ).rejects.toThrow('Passwords do not match');
    });

    it('should reject a weak password', async () => {
      await expect(
        authService.register({
          name: 'User',
          email: `weak_${Date.now()}@example.com`,
          password: 'weak',
          confirmPassword: 'weak',
        })
      ).rejects.toThrow();
    });
  });

  describe('login', () => {
    it('should login with correct credentials', async () => {
      const result = await authService.login({ email: testEmail, password: testPassword });
      expect(result.user.email).toBe(testEmail);
      expect(result.accessToken).toBeDefined();
    });

    it('should reject wrong password', async () => {
      await expect(
        authService.login({ email: testEmail, password: 'WrongPass123!' })
      ).rejects.toThrow('Invalid credentials');
    });

    it('should reject non-existent email', async () => {
      await expect(
        authService.login({ email: 'nobody@example.com', password: testPassword })
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('refreshToken', () => {
    it('should return new tokens with a valid refresh token', async () => {
      const loginResult = await authService.login({ email: testEmail, password: testPassword });
      const result = await authService.refreshToken({ refreshToken: loginResult.refreshToken });
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should reject an access token used as refresh token', async () => {
      const loginResult = await authService.login({ email: testEmail, password: testPassword });
      await expect(
        authService.refreshToken({ refreshToken: loginResult.accessToken })
      ).rejects.toThrow('Invalid token type');
    });
  });

  describe('getProfile', () => {
    it('should return the user profile', async () => {
      const loginResult = await authService.login({ email: testEmail, password: testPassword });
      const profile = await authService.getProfile(loginResult.user.id);
      expect(profile.email).toBe(testEmail);
    });

    it('should throw for non-existent user ID', async () => {
      await expect(authService.getProfile('nonexistent_id')).rejects.toThrow('User not found');
    });
  });

  describe('changePassword', () => {
    it('should change password with correct current password', async () => {
      const loginResult = await authService.login({ email: testEmail, password: testPassword });

      await expect(
        authService.changePassword(loginResult.user.id, {
          currentPassword: testPassword,
          newPassword: 'NewPass456!',
          confirmPassword: 'NewPass456!',
        })
      ).resolves.not.toThrow();

      // Verify new password works
      await expect(
        authService.login({ email: testEmail, password: 'NewPass456!' })
      ).resolves.toBeDefined();
    });

    it('should reject incorrect current password', async () => {
      const loginResult = await authService.login({ email: testEmail, password: 'NewPass456!' });
      await expect(
        authService.changePassword(loginResult.user.id, {
          currentPassword: 'WrongPass123!',
          newPassword: 'AnotherPass789!',
          confirmPassword: 'AnotherPass789!',
        })
      ).rejects.toThrow('Current password is incorrect');
    });
  });
});
