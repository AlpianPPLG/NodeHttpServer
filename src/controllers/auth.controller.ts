import { Request, Response } from 'express';

import { asyncHandler } from '../middleware/errorHandler';
import { ServiceUnavailableError } from '../types/error.types';
import { authService } from '@/services/auth.service';
import { registerSchema, loginSchema } from '@/schemas/auth.schema';

export class AuthController {
  public register = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      // Validate request
      const validationResult = registerSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: validationResult.error.errors,
        });
        return;
      }

      const { email, username, password, firstName, lastName } =
        validationResult.data;

      // Register user
      const { user, accessToken, refreshToken } = await authService.register(
        email,
        username,
        password,
        firstName,
        lastName
      );

      res.status(201).json({
        status: 'success',
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            isActive: user.isActive,
            isEmailVerified: user.isEmailVerified,
            createdAt: user.createdAt,
          },
          tokens: {
            accessToken,
            refreshToken,
          },
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0.0',
        },
      });
    }
  );

  public login = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      // Validate request
      const validationResult = loginSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: validationResult.error.errors,
        });
        return;
      }

      const { email, password } = validationResult.data;

      // Login user
      const { user, accessToken, refreshToken } = await authService.login(
        email,
        password,
        req.get('User-Agent'),
        req.ip
      );

      res.status(200).json({
        status: 'success',
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            isActive: user.isActive,
            isEmailVerified: user.isEmailVerified,
            lastLoginAt: user.lastLoginAt,
          },
          tokens: {
            accessToken,
            refreshToken,
          },
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0.0',
        },
      });
    }
  );

  public refresh = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          status: 'error',
          message: 'Refresh token is required',
        });
      }

      const { accessToken } =
        await authService.refreshAccessToken(refreshToken);

      res.status(200).json({
        status: 'success',
        data: {
          accessToken,
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0.0',
        },
      });
    }
  );

  public logout = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await authService.logout(refreshToken);
    }

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  });

  public forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    // TODO: Implement password reset flow
    res.status(200).json({
      status: 'success',
      message: 'If email exists, password reset instructions will be sent',
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  });

  public resetPassword = asyncHandler(async (req: Request, res: Response) => {
    // TODO: Implement password reset with token
    throw new ServiceUnavailableError('Password reset not implemented yet');
  });
}

export const authController = new AuthController();
