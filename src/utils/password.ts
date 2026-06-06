/**
 * Password hashing utilities
 */

import * as bcrypt from 'bcryptjs';
import { config } from '../config/env';
import { logger } from './logger';

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const salt = await bcrypt.genSalt(config.auth.bcryptRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    logger.debug('Password hashed successfully', {
      component: 'auth',
      saltRounds: config.auth.bcryptRounds,
    });
    
    return hashedPassword;
  } catch (error) {
    logger.error('Error hashing password', {
      error: error instanceof Error ? error.message : 'Unknown error',
      component: 'auth',
    });
    throw new Error('Failed to hash password');
  }
}

/**
 * Compare a plain password with a hashed password
 */
export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    
    logger.debug('Password comparison completed', {
      component: 'auth',
      isMatch,
    });
    
    return isMatch;
  } catch (error) {
    logger.error('Error comparing password', {
      error: error instanceof Error ? error.message : 'Unknown error',
      component: 'auth',
    });
    throw new Error('Failed to compare password');
  }
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Minimum length
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  // Maximum length
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters long');
  }
  
  // Must contain uppercase
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  // Must contain lowercase
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  // Must contain number
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  // Must contain special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  // Common passwords check
  const commonPasswords = [
    'password',
    '123456',
    'qwerty',
    'admin',
    'letmein',
    'welcome',
    'monkey',
    'dragon',
  ];
  
  if (commonPasswords.some(common => 
    password.toLowerCase().includes(common)
  )) {
    errors.push('Password cannot contain common words');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}