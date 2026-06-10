import { Request, Response } from 'express';
import AuthService, { RegisterPayload, LoginPayload, AuthResponse, DecodedToken } from '../../domain/services/AuthService';
import { InMemoryRepository } from '../../infrastructure/repositories/InMemoryRepository';
import { ValidationError, ConflictError, UnauthorizedError } from '../../shared/errors';
import { User, APIResponse } from '../../shared/types';

export class AuthController {
  private authService: AuthService;
  private repository: InMemoryRepository;

  constructor() {
    this.authService = new AuthService();
    this.repository = InMemoryRepository.getInstance();
  }

  /**
   * Register new user
   * POST /auth/register
   */
  register = async (req: Request, res: Response): Promise<void> => {
    const { email, password, name } = req.body;

    // Validate input
    const validation = this.authService.validateRegistration({
      email,
      password,
      name,
    } as RegisterPayload);

    if (!validation.valid) {
      throw new ValidationError(validation.message || 'Invalid registration data');
    }

    // Check if user already exists
    const existingUser = this.repository.getUserByEmail(email);
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Create user
    const user = await this.authService.createUser({
      email,
      password,
      name,
    });

    // Save user to repository
    this.repository.saveUser(user);

    // Generate token
    const token = this.authService.generateToken(user.id, user.email);

    // Return response without password
    const userResponse: User = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    };

    const response: APIResponse<AuthResponse> = {
      success: true,
      data: {
        user: userResponse,
        token,
      },
    };

    res.status(201).json(response);
  };

  /**
   * Login user
   * POST /auth/login
   */
  login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    // Validate input
    const validation = this.authService.validateLogin({
      email,
      password,
    } as LoginPayload);

    if (!validation.valid) {
      throw new ValidationError(validation.message || 'Invalid login data');
    }

    // Find user by email
    const user = this.repository.getUserByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await this.authService.comparePasswords(password, user.password || '');
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate token
    const token = this.authService.generateToken(user.id, user.email);

    // Return response without password
    const userResponse: User = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    };

    const response: APIResponse<AuthResponse> = {
      success: true,
      data: {
        user: userResponse,
        token,
      },
    };

    res.status(200).json(response);
  };

  /**
   * Get current user profile
   * GET /auth/me
   * Requires: Valid JWT token
   */
  getCurrentUser = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    const user = this.repository.getUser(req.user.userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    const userResponse: User = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    };

    const response: APIResponse<User> = {
      success: true,
      data: userResponse,
    };

    res.status(200).json(response);
  };

  /**
   * Verify token validity
   * GET /auth/verify
   * Requires: Valid JWT token
   */
  verifyToken = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError('Invalid token');
    }

    const response: APIResponse<{ valid: boolean; user: DecodedToken }> = {
      success: true,
      data: {
        valid: true,
        user: req.user,
      },
    };

    res.status(200).json(response);
  };
}

export default AuthController;
