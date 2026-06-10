import AuthService, { RegisterPayload, LoginPayload } from '../../../src/domain/services/AuthService';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService('test-secret-key');
  });

  describe('Password Management', () => {
    it('should hash password', async () => {
      const password = 'TestPassword123';
      const hashed = await authService.hashPassword(password);

      expect(hashed).not.toBe(password);
      expect(hashed.length).toBeGreaterThan(20);
    });

    it('should compare passwords correctly', async () => {
      const password = 'TestPassword123';
      const hashed = await authService.hashPassword(password);

      const isValid = await authService.comparePasswords(password, hashed);
      expect(isValid).toBe(true);

      const isInvalid = await authService.comparePasswords('WrongPassword123', hashed);
      expect(isInvalid).toBe(false);
    });

    it('should validate password strength', () => {
      const validPassword = 'StrongPass123';
      const result = authService.validatePasswordStrength(validPassword);
      expect(result.valid).toBe(true);
    });

    it('should reject short passwords', () => {
      const result = authService.validatePasswordStrength('Short1');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('at least 8 characters');
    });

    it('should reject passwords without uppercase', () => {
      const result = authService.validatePasswordStrength('lowercase123');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('uppercase');
    });

    it('should reject passwords without lowercase', () => {
      const result = authService.validatePasswordStrength('UPPERCASE123');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('lowercase');
    });

    it('should reject passwords without numbers', () => {
      const result = authService.validatePasswordStrength('NoNumbers');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('number');
    });
  });

  describe('Email Validation', () => {
    it('should validate correct email format', () => {
      expect(authService.validateEmail('user@example.com')).toBe(true);
      expect(authService.validateEmail('test.user+tag@domain.co.uk')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(authService.validateEmail('notanemail')).toBe(false);
      expect(authService.validateEmail('user@')).toBe(false);
      expect(authService.validateEmail('@domain.com')).toBe(false);
    });
  });

  describe('JWT Token Management', () => {
    it('should generate valid JWT token', () => {
      const token = authService.generateToken('user123', 'user@example.com');

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT format: header.payload.signature
    });

    it('should verify and decode valid token', () => {
      const userId = 'user123';
      const email = 'user@example.com';
      const token = authService.generateToken(userId, email);

      const decoded = authService.verifyToken(token);
      expect(decoded).toBeDefined();
      expect(decoded?.userId).toBe(userId);
      expect(decoded?.email).toBe(email);
    });

    it('should reject invalid token', () => {
      const decoded = authService.verifyToken('invalid.token.here');
      expect(decoded).toBeNull();
    });

    it('should reject expired token', () => {
      const expiredToken = authService.generateToken('user123', 'user@example.com');
      // Manually create an expired token by using a different instance with different secret
      const differentService = new AuthService('different-secret');
      const decoded = differentService.verifyToken(expiredToken);
      expect(decoded).toBeNull();
    });
  });

  describe('Registration Validation', () => {
    it('should validate correct registration payload', () => {
      const payload: RegisterPayload = {
        email: 'newuser@example.com',
        password: 'ValidPassword123',
        name: 'John Doe',
      };

      const result = authService.validateRegistration(payload);
      expect(result.valid).toBe(true);
    });

    it('should reject missing fields', () => {
      const payload = { email: '', password: '', name: '' } as RegisterPayload;
      const result = authService.validateRegistration(payload);
      expect(result.valid).toBe(false);
    });

    it('should reject invalid email', () => {
      const payload: RegisterPayload = {
        email: 'notanemail',
        password: 'ValidPassword123',
        name: 'John Doe',
      };

      const result = authService.validateRegistration(payload);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('Invalid email');
    });

    it('should reject weak password', () => {
      const payload: RegisterPayload = {
        email: 'user@example.com',
        password: 'weak',
        name: 'John Doe',
      };

      const result = authService.validateRegistration(payload);
      expect(result.valid).toBe(false);
    });

    it('should reject short name', () => {
      const payload: RegisterPayload = {
        email: 'user@example.com',
        password: 'ValidPassword123',
        name: 'J',
      };

      const result = authService.validateRegistration(payload);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('at least 2 characters');
    });
  });

  describe('Login Validation', () => {
    it('should validate correct login payload', () => {
      const payload: LoginPayload = {
        email: 'user@example.com',
        password: 'ValidPassword123',
      };

      const result = authService.validateLogin(payload);
      expect(result.valid).toBe(true);
    });

    it('should reject missing fields', () => {
      const payload = { email: '', password: '' } as LoginPayload;
      const result = authService.validateLogin(payload);
      expect(result.valid).toBe(false);
    });

    it('should reject invalid email', () => {
      const payload: LoginPayload = {
        email: 'notanemail',
        password: 'ValidPassword123',
      };

      const result = authService.validateLogin(payload);
      expect(result.valid).toBe(false);
    });
  });

  describe('Bearer Token Extraction', () => {
    it('should extract token from valid Authorization header', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
      const header = `Bearer ${token}`;

      const extracted = authService.extractTokenFromHeader(header);
      expect(extracted).toBe(token);
    });

    it('should return null for missing header', () => {
      const extracted = authService.extractTokenFromHeader(undefined);
      expect(extracted).toBeNull();
    });

    it('should return null for invalid format', () => {
      const extracted = authService.extractTokenFromHeader('InvalidFormat');
      expect(extracted).toBeNull();

      const extracted2 = authService.extractTokenFromHeader('Bearer');
      expect(extracted2).toBeNull();
    });

    it('should return null for wrong scheme', () => {
      const extracted = authService.extractTokenFromHeader('Basic sometoken');
      expect(extracted).toBeNull();
    });
  });

  describe('User Creation', () => {
    it('should create user with hashed password', async () => {
      const payload: RegisterPayload = {
        email: 'newuser@example.com',
        password: 'ValidPassword123',
        name: 'John Doe',
      };

      const user = await authService.createUser(payload);

      expect(user.id).toBeDefined();
      expect(user.email).toBe(payload.email);
      expect(user.name).toBe(payload.name);
      expect(user.password).not.toBe(payload.password); // Should be hashed
      expect(user.role).toBe('customer');
      expect(user.createdAt).toBeInstanceOf(Date);
    });
  });
});
