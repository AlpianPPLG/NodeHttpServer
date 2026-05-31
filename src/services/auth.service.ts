/**
 * Authentication service
 * Handles all authentication-related business logic
 */

import jwt, { type SignOptions } from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { prisma } from '@/database';
import { config } from '@/config/env';
import { ConflictError, UnauthorizedError } from '@/types/error.types';
import type { User as PrismaUser } from '@prisma/client';

export class AuthService {
  /**
   * Register a new user
   */
  public async register(
    email: string,
    username: string,
    password: string,
    firstName?: string,
    lastName?: string
  ): Promise<{
    user: Omit<PrismaUser, 'password'>;
    accessToken: string;
    refreshToken: string;
  }> {
    // Check if email already exists
    const existingEmailUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmailUser) {
      throw new ConflictError('Email already exists');
    }

    // Check if username already exists
    const existingUsernameUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUsernameUser) {
      throw new ConflictError('Username already exists');
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(
      password,
      config.auth.bcryptRounds
    );

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null,
      },
    });

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user.id);

    // Create session
    const refreshTokenExpiry = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
    );

    await prisma.userSession.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt: refreshTokenExpiry,
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Login user
   */
  public async login(
    email: string,
    password: string,
    userAgent?: string,
    ipAddress?: string
  ): Promise<{
    user: Omit<PrismaUser, 'password'>;
    accessToken: string;
    refreshToken: string;
  }> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcryptjs.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user.id);

    // Create session
    const refreshTokenExpiry = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
    );

    await prisma.userSession.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt: refreshTokenExpiry,
        userAgent: userAgent || null,
        ipAddress: ipAddress || null,
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Generate JWT tokens
   */
  public async generateTokens(userId: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const accessToken = jwt.sign(
      { userId, type: 'access' },
      config.auth.jwtSecret,
      {
        expiresIn: config.auth.jwtExpiration,
      } as SignOptions
    );

    const refreshToken = jwt.sign(
      { userId, type: 'refresh' },
      config.auth.jwtSecret,
      {
        expiresIn: config.auth.jwtRefreshExpiration,
      } as SignOptions
    );

    return { accessToken, refreshToken };
  }

  /**
   * Verify JWT token
   */
  public verifyToken(token: string): { userId: string; type: string } {
    try {
      const decoded = jwt.verify(token, config.auth.jwtSecret) as {
        userId: string;
        type: string;
      };
      return decoded;
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired token');
    }
  }

  /**
   * Refresh access token
   */
  public async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
  }> {
    try {
      const decoded = this.verifyToken(refreshToken);

      if (decoded.type !== 'refresh') {
        throw new UnauthorizedError('Invalid refresh token');
      }

      // Check if session exists and is active
      const session = await prisma.userSession.findUnique({
        where: { refreshToken },
      });

      if (!session || !session.isActive || new Date() > session.expiresAt) {
        throw new UnauthorizedError('Refresh token expired or revoked');
      }

      // Generate new access token
      const accessToken = jwt.sign(
        { userId: decoded.userId, type: 'access' },
        config.auth.jwtSecret,
        {
          expiresIn: config.auth.jwtExpiration,
        } as SignOptions
      );

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  /**
   * Logout user (revoke session)
   */
  public async logout(refreshToken: string): Promise<void> {
    await prisma.userSession
      .update({
        where: { refreshToken },
        data: {
          isActive: false,
          revokedAt: new Date(),
        },
      })
      .catch(() => {
        // Session might not exist, that's okay
      });
  }
}

export const authService = new AuthService();
