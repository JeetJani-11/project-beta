import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { randomUUID } from 'crypto';
import { User } from '../../shared/types';

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface DecodedToken {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

export class AuthService {
  private readonly jwtSecret: string;
  private readonly jwtExpiryDays: number = 30;

  constructor(jwtSecret?: string) {
    this.jwtSecret = jwtSecret || process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  }

  /**
   * Hash password using bcryptjs
   */
  async hashPassword(password: string): Promise<string> {
    const salt = await bcryptjs.genSalt(10);
    return bcryptjs.hash(password, salt);
  }

  /**
   * Compare plain text password with hashed password
   */
  async comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcryptjs.compare(plainPassword, hashedPassword);
  }

  /**
   * Validate password strength
   * Requirements: at least 8 characters, 1 uppercase, 1 lowercase, 1 number
   */
  validatePasswordStrength(password: string): { valid: boolean; message?: string } {
    if (password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters' };
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least 1 uppercase letter' };
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least 1 lowercase letter' };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, message: 'Password must contain at least 1 number' };
    }
    return { valid: true };
  }

  /**
   * Validate email format
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Generate JWT token for user
   */
  generateToken(userId: string, email: string): string {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + this.jwtExpiryDays);

    return jwt.sign(
      {
        userId,
        email,
      },
      this.jwtSecret,
      {
        expiresIn: `${this.jwtExpiryDays}d`,
        algorithm: 'HS256',
      }
    );
  }

  /**
   * Verify and decode JWT token
   */
  verifyToken(token: string): DecodedToken | null {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as DecodedToken;
      return decoded;
    } catch (error) {
      return null;
    }
  }

  /**
   * Create new user from registration payload
   */
  async createUser(payload: RegisterPayload): Promise<User> {
    const hashedPassword = await this.hashPassword(payload.password);

    return {
      id: randomUUID(),
      email: payload.email,
      name: payload.name,
      password: hashedPassword,
      createdAt: new Date(),
      role: 'customer',
    };
  }

  /**
   * Validate registration payload
   */
  validateRegistration(payload: RegisterPayload): { valid: boolean; message?: string } {
    if (!payload.email || !payload.password || !payload.name) {
      return { valid: false, message: 'Email, password, and name are required' };
    }

    if (!this.validateEmail(payload.email)) {
      return { valid: false, message: 'Invalid email format' };
    }

    const passwordValidation = this.validatePasswordStrength(payload.password);
    if (!passwordValidation.valid) {
      return passwordValidation;
    }

    if (payload.name.trim().length < 2) {
      return { valid: false, message: 'Name must be at least 2 characters' };
    }

    return { valid: true };
  }

  /**
   * Validate login payload
   */
  validateLogin(payload: LoginPayload): { valid: boolean; message?: string } {
    if (!payload.email || !payload.password) {
      return { valid: false, message: 'Email and password are required' };
    }

    if (!this.validateEmail(payload.email)) {
      return { valid: false, message: 'Invalid email format' };
    }

    return { valid: true };
  }

  /**
   * Extract token from Authorization header
   */
  extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }
}

export default AuthService;
