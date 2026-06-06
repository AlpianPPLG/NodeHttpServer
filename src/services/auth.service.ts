/**
 * Authentication Service
 */

import { mockUserRepository } from '../repositories/mock-user.repository';
import { 
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshTokenRequest,
  AuthUser,
  MockUser
} from '../types/auth.types';
import {
  BadRequestError,
  UnauthorizedError,
  ConflictError,
  NotFoundError
} from '../types/error.types';
import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/password';
import { 
  generateAccessToken, 
  generateRefreshToken, 
  verifyToken, 
  getTokenExpirationTime 
} from '../utils/jwt';
import { logger } from '../utils/logger';

class AuthService {
  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const { name, email, password, confirmPassword } = data;

    // Validate input
    if (!name?.trim()) {
      throw new BadRequestError('Name is required');
    }

    if (!email?.trim()) {
      throw new BadRequestError('Email is required');
    }

    if (!password) {
      throw new BadRequestError('Password is required');
    }

    if (password !== confirmPassword) {
      throw new BadRequestError('Passwords do not match');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestError('Invalid email format');
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      throw new BadRequestError(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
    }

    // Check if user already exists
    const existingUser = await mockUserRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await mockUserRepository.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'USER',
    });

    logger.info('User registered successfully', {
      component: 'auth',
      userId: user.id,
      email: user.email,
    });

    // Generate tokens
    const authUser = this.mapToAuthUser(user);
    const accessToken = generateAccessToken(authUser);
    const refreshToken = generateRefreshToken(authUser);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
      },
      accessToken,
      refreshToken,
      expiresIn: getTokenExpirationTime(),
    };
  }

  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const { email, password } = data;

    // Validate input
    if (!email?.trim()) {
      throw new BadRequestError('Email is required');
    }

    if (!password) {
      throw new BadRequestError('Password is required');
    }

    // Find user
    const user = await mockUserRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Check user status
    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedError('Account is suspended or banned');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      logger.warn('Login attempt with invalid password', {
        component: 'auth',
        email: user.email,
        userId: user.id,
      });
      throw new UnauthorizedError('Invalid credentials');
    }

    logger.info('User logged in successfully', {
      component: 'auth',
      userId: user.id,
      email: user.email,
    });

    // Generate tokens
    const authUser = this.mapToAuthUser(user);
    const accessToken = generateAccessToken(authUser);
    const refreshToken = generateRefreshToken(authUser);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
      },
      accessToken,
      refreshToken,
      expiresIn: getTokenExpirationTime(),
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(data: RefreshTokenRequest): Promise<AuthResponse> {
    const { refreshToken } = data;

    if (!refreshToken) {
      throw new BadRequestError('Refresh token is required');
    }

    // Verify refresh token
    let payload;
    try {
      payload = verifyToken(refreshToken);
    } catch (error) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // Check if it's a refresh token
    if (payload.type !== 'refresh') {
      throw new UnauthorizedError('Invalid token type');
    }

    // Find user
    const user = await mockUserRepository.findById(payload.userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Check user status
    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedError('Account is suspended or banned');
    }

    logger.info('Token refreshed successfully', {
      component: 'auth',
      userId: user.id,
    });

    // Generate new tokens
    const authUser = this.mapToAuthUser(user);
    const newAccessToken = generateAccessToken(authUser);
    const newRefreshToken = generateRefreshToken(authUser);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
      },
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: getTokenExpirationTime(),
    };
  }

  /**
   * Get user profile
   */
  async getProfile(userId: string): Promise<AuthUser> {
    const user = await mockUserRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return this.mapToAuthUser(user);
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: {
    name?: string;
    email?: string;
  }): Promise<AuthUser> {
    const user = await mockUserRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updateData: Partial<MockUser> = {};

    if (data.name !== undefined) {
      if (!data.name.trim()) {
        throw new BadRequestError('Name cannot be empty');
      }
      updateData.name = data.name.trim();
    }

    if (data.email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        throw new BadRequestError('Invalid email format');
      }

      // Check if email is already taken by another user
      const existingUser = await mockUserRepository.findByEmail(data.email);
      if (existingUser && existingUser.id !== userId) {
        throw new ConflictError('Email already taken');
      }

      updateData.email = data.email.toLowerCase().trim();
    }

    const updatedUser = await mockUserRepository.update(userId, updateData);
    if (!updatedUser) {
      throw new NotFoundError('User not found');
    }

    logger.info('User profile updated', {
      component: 'auth',
      userId,
      updatedFields: Object.keys(updateData),
    });

    return this.mapToAuthUser(updatedUser);
  }

  /**
   * Change password
   */
  async changePassword(userId: string, data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<void> {
    const { currentPassword, newPassword, confirmPassword } = data;

    // Validate input
    if (!currentPassword) {
      throw new BadRequestError('Current password is required');
    }

    if (!newPassword) {
      throw new BadRequestError('New password is required');
    }

    if (newPassword !== confirmPassword) {
      throw new BadRequestError('Passwords do not match');
    }

    // Find user
    const user = await mockUserRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      throw new BadRequestError(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await mockUserRepository.changePassword(userId, hashedPassword);

    logger.info('Password changed successfully', {
      component: 'auth',
      userId,
    });
  }

  /**
   * Logout user (for future token blacklisting)
   */
  async logout(userId: string): Promise<void> {
    logger.info('User logged out', {
      component: 'auth',
      userId,
    });
    // In a real implementation, you would blacklist the tokens
    // For now, we just log the logout
  }

  /**
   * Map MockUser to AuthUser (remove sensitive fields)
   */
  private mapToAuthUser(user: MockUser): AuthUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerified: user.emailVerified,
    };
  }
}

export const authService = new AuthService();