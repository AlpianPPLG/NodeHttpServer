/**
 * Mock User Repository for development without database
 * This will be replaced with actual Prisma repository when database is available
 */

import { MockUser, Role, UserStatus } from '../types/auth.types';
import { hashPassword } from '../utils/password';
import { logger } from '../utils/logger';

// In-memory storage (for development only)
const users: Map<string, MockUser> = new Map();
const usersByEmail: Map<string, string> = new Map(); // email -> id mapping

let userIdCounter = 1;

/**
 * Generate mock user ID
 */
function generateUserId(): string {
  return `user_${userIdCounter++}`;
}

/**
 * Initialize with default users
 */
async function initializeDefaultUsers(): Promise<void> {
  try {
    // Admin user
    const adminId = generateUserId();
    const adminPassword = await hashPassword('admin123');
    const admin: MockUser = {
      id: adminId,
      email: 'admin@velocity.dev',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    users.set(adminId, admin);
    usersByEmail.set(admin.email, adminId);

    // Regular user
    const userId = generateUserId();
    const userPassword = await hashPassword('user123');
    const user: MockUser = {
      id: userId,
      email: 'user@velocity.dev',
      name: 'Test User',
      password: userPassword,
      role: 'USER',
      status: 'ACTIVE',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    users.set(userId, user);
    usersByEmail.set(user.email, userId);

    logger.info('Mock users initialized', {
      component: 'auth',
      userCount: users.size,
    });
  } catch (error) {
    logger.error('Failed to initialize mock users', {
      component: 'auth',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// Initialize default users
initializeDefaultUsers();

export class MockUserRepository {
  /**
   * Find user by ID
   */
  async findById(id: string): Promise<MockUser | null> {
    const user = users.get(id);
    return user || null;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<MockUser | null> {
    const userId = usersByEmail.get(email.toLowerCase());
    if (!userId) return null;
    
    const user = users.get(userId);
    return user || null;
  }

  /**
   * Create new user
   */
  async create(data: {
    name: string;
    email: string;
    password: string;
    role?: Role;
  }): Promise<MockUser> {
    // Check if email exists
    const existingUser = await this.findByEmail(data.email);
    if (existingUser) {
      throw new Error('Email already exists');
    }

    const id = generateUserId();
    const now = new Date();

    const user: MockUser = {
      id,
      email: data.email.toLowerCase(),
      name: data.name,
      password: data.password, // Should be hashed before calling this
      role: data.role || 'USER',
      status: 'ACTIVE',
      emailVerified: false,
      createdAt: now,
      updatedAt: now,
    };

    users.set(id, user);
    usersByEmail.set(user.email, id);

    logger.info('User created', {
      component: 'auth',
      userId: id,
      email: data.email,
    });

    return user;
  }

  /**
   * Update user
   */
  async update(id: string, data: Partial<MockUser>): Promise<MockUser | null> {
    const user = users.get(id);
    if (!user) return null;

    const updatedUser: MockUser = {
      ...user,
      ...data,
      id, // Ensure ID doesn't change
      updatedAt: new Date(),
    };

    users.set(id, updatedUser);

    // Update email mapping if email changed
    if (data.email && data.email !== user.email) {
      usersByEmail.delete(user.email);
      usersByEmail.set(data.email.toLowerCase(), id);
    }

    logger.info('User updated', {
      component: 'auth',
      userId: id,
      updatedFields: Object.keys(data),
    });

    return updatedUser;
  }

  /**
   * Delete user
   */
  async delete(id: string): Promise<boolean> {
    const user = users.get(id);
    if (!user) return false;

    users.delete(id);
    usersByEmail.delete(user.email);

    logger.info('User deleted', {
      component: 'auth',
      userId: id,
    });

    return true;
  }

  /**
   * List all users (for admin)
   */
  async findAll(options?: {
    page?: number;
    limit?: number;
    offset?: number;
    role?: Role;
    status?: UserStatus;
    search?: string;
  }): Promise<MockUser[]> {
    let userList = Array.from(users.values());

    // Filter by role
    if (options?.role) {
      userList = userList.filter(user => user.role === options.role);
    }

    // Filter by status
    if (options?.status) {
      userList = userList.filter(user => user.status === options.status);
    }

    // Search by name or email
    if (options?.search) {
      const searchLower = options.search.toLowerCase();
      userList = userList.filter(
        user =>
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
      );
    }

    // Apply pagination
    const offset = options?.offset ?? ((options?.page ?? 1) - 1) * (options?.limit ?? 20);
    const limit = options?.limit ?? 20;
    userList = userList.slice(offset, offset + limit);

    return userList;
  }

  /**
   * Get user count
   */
  async count(): Promise<number> {
    return users.size;
  }

  /**
   * Verify email
   */
  async verifyEmail(id: string): Promise<MockUser | null> {
    return this.update(id, { emailVerified: true });
  }

  /**
   * Change password
   */
  async changePassword(id: string, hashedPassword: string): Promise<MockUser | null> {
    return this.update(id, { password: hashedPassword });
  }
}

export const mockUserRepository = new MockUserRepository();