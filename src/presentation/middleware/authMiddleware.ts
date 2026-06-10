import { Request, Response, NextFunction } from 'express';
import AuthService, { DecodedToken } from '../../domain/services/AuthService';
import { UnauthorizedError, ForbiddenError } from '../../shared/errors';
import { InMemoryRepository } from '../../infrastructure/repositories/InMemoryRepository';

// Extend Express Request to include user and token
declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
      token?: string;
    }
  }
}

export class AuthMiddleware {
  private authService: AuthService;
  private repository: InMemoryRepository;

  constructor(jwtSecret?: string) {
    this.authService = new AuthService(jwtSecret);
    this.repository = InMemoryRepository.getInstance();
  }

  /**
   * Middleware to verify JWT token from Authorization header
   */
  verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;
    const token = this.authService.extractTokenFromHeader(authHeader);

    if (!token) {
      throw new UnauthorizedError('No authorization token provided');
    }

    const decoded = this.authService.verifyToken(token);
    if (!decoded) {
      throw new UnauthorizedError('Invalid or expired token');
    }

    req.user = decoded;
    req.token = token;
    next();
  };

  /**
   * Optional middleware - doesn't fail if no token, but adds user if valid token present
   */
  optionalVerifyToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      const token = this.authService.extractTokenFromHeader(authHeader);

      if (token) {
        const decoded = this.authService.verifyToken(token);
        if (decoded) {
          req.user = decoded;
          req.token = token;
        }
      }
    } catch (error) {
      // Silently fail for optional auth
    }
    next();
  };

  /**
   * Middleware to require admin role
   */
  requireAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    // Fetch user from repository to check role
    const user = this.repository.getUser(req.user.userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (user.role !== 'admin') {
      throw new ForbiddenError('Admin access required');
    }

    next();
  };
}

export default AuthMiddleware;
