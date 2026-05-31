import { Request, Response } from 'express';

import { asyncHandler } from '../middleware/errorHandler';
import { ServiceUnavailableError, NotFoundError } from '../types/error.types';
import { prisma } from '@/database';

export class UsersController {
  public getUsers = asyncHandler(async (req: Request, _res: Response) => {
    // Get pagination params
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(
      1,
      Math.min(100, parseInt(req.query.limit as string) || 10)
    );
    const skip = (page - 1) * limit;

    // Get total count
    const total = await prisma.user.count();

    // Get users with pagination
    const users = await prisma.user.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        bio: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    _res.status(200).json({
      status: 'success',
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  });

  public getUserById = asyncHandler(async (req: Request, _res: Response) => {
    const { id } = req.params;

    if (!id) {
      throw new NotFoundError('User not found');
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        bio: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError(`User with id ${id} not found`);
    }

    _res.status(200).json({
      status: 'success',
      data: user,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  });
}

export const usersController = new UsersController();
