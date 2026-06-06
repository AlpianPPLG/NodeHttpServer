/**
 * Users Controller
 * Handles HTTP requests for user management endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { mockUserRepository } from '../repositories/mock-user.repository';
import { NotFoundError, ForbiddenError } from '../types/error.types';
import { logger } from '../utils/logger';

class UsersController {
  /**
   * Get all users
   * GET /api/v1/users
   */
  async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = '1', limit = '20', search } = req.query;
      
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);

      const users = await mockUserRepository.findAll({
        page: pageNum,
        limit: limitNum,
        search: search as string,
      });

      const total = await mockUserRepository.count();

      logger.info('Users fetched successfully', {
        component: 'users-controller',
        count: users.length,
        page: pageNum,
        requestId: req.requestId ?? '',
      });

      res.status(200).json({
        status: 'success',
        data: {
          users: users.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            emailVerified: user.emailVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          })),
        },
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user by ID
   * GET /api/v1/users/:id
   */
  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id!;

      const user = await mockUserRepository.findById(id);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      res.status(200).json({
        status: 'success',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            emailVerified: user.emailVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user
   * PUT /api/v1/users/:id
   */
  async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id!;
      const { name, email, role, status } = req.body;

      // Check if user exists
      const existingUser = await mockUserRepository.findById(id);
      if (!existingUser) {
        throw new NotFoundError('User not found');
      }

      // Check permission: only admins can update other users
      if (req.user?.role !== 'ADMIN' && req.userId !== id) {
        throw new ForbiddenError('You can only update your own profile');
      }

      // Regular users cannot change their role or status
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (email !== undefined) updateData.email = email;

      // Only admins can change role and status
      if (req.user?.role === 'ADMIN') {
        if (role !== undefined) updateData.role = role;
        if (status !== undefined) updateData.status = status;
      }

      const updatedUser = await mockUserRepository.update(id, updateData);
      if (!updatedUser) {
        throw new NotFoundError('User not found');
      }

      logger.info('User updated successfully', {
        component: 'users-controller',
        userId: id,
        updatedBy: req.userId,
        requestId: req.requestId,
      });

      res.status(200).json({
        status: 'success',
        message: 'User updated successfully',
        data: {
          user: {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            status: updatedUser.status,
            emailVerified: updatedUser.emailVerified,
            createdAt: updatedUser.createdAt,
            updatedAt: updatedUser.updatedAt,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete user
   * DELETE /api/v1/users/:id
   */
  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id!;

      // Check if user exists
      const user = await mockUserRepository.findById(id);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Only admins can delete users
      if (req.user?.role !== 'ADMIN') {
        throw new ForbiddenError('Only administrators can delete users');
      }

      await mockUserRepository.delete(id);

      logger.info('User deleted successfully', {
        component: 'users-controller',
        userId: id,
        deletedBy: req.userId,
        requestId: req.requestId,
      });

      res.status(200).json({
        status: 'success',
        message: 'User deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user by email
   * GET /api/v1/users/email/:email
   */
  async getUserByEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const email = req.params.email!;

      const user = await mockUserRepository.findByEmail(email);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      res.status(200).json({
        status: 'success',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            emailVerified: user.emailVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const usersController = new UsersController();
