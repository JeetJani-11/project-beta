/**
 * Unit tests for error classes
 */

import {
  CustomError,
  ValidationError,
  NotFoundError,
  BadRequestError,
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
  InternalServerError,
} from '../../../src/shared/errors';

describe('Error Classes', () => {
  describe('CustomError', () => {
    it('should create a custom error with correct properties', () => {
      const error = new CustomError('TEST_ERROR', 'Test message', 400, {
        field: 'value',
      });

      expect(error.code).toBe('TEST_ERROR');
      expect(error.message).toBe('Test message');
      expect(error.statusCode).toBe(400);
      expect(error.details).toEqual({ field: 'value' });
      expect(error.timestamp).toBeInstanceOf(Date);
    });

    it('should convert error to JSON format', () => {
      const error = new CustomError('TEST_ERROR', 'Test message', 400);
      const json = error.toJSON();

      expect(json).toHaveProperty('success', false);
      expect(json).toHaveProperty('error');
      expect(json.error).toHaveProperty('code', 'TEST_ERROR');
      expect(json.error).toHaveProperty('message', 'Test message');
      expect(json.error).toHaveProperty('timestamp');
    });

    it('should be instanceof CustomError', () => {
      const error = new CustomError('TEST', 'Test', 400);
      expect(error instanceof CustomError).toBe(true);
    });
  });

  describe('ValidationError', () => {
    it('should create with correct status code 400', () => {
      const error = new ValidationError('Invalid input');

      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.statusCode).toBe(400);
      expect(error instanceof ValidationError).toBe(true);
    });

    it('should include details if provided', () => {
      const details = { field: 'email', reason: 'invalid format' };
      const error = new ValidationError('Invalid email', details);

      expect(error.details).toEqual(details);
    });
  });

  describe('NotFoundError', () => {
    it('should create with correct status code 404', () => {
      const error = new NotFoundError('Product');

      expect(error.code).toBe('NOT_FOUND');
      expect(error.statusCode).toBe(404);
      expect(error.message).toContain('not found');
      expect(error instanceof NotFoundError).toBe(true);
    });

    it('should include id in message if provided', () => {
      const error = new NotFoundError('Product', '123');

      expect(error.message).toContain('Product');
      expect(error.message).toContain('123');
    });
  });

  describe('BadRequestError', () => {
    it('should create with correct status code 400', () => {
      const error = new BadRequestError('Bad request');

      expect(error.code).toBe('BAD_REQUEST');
      expect(error.statusCode).toBe(400);
      expect(error instanceof BadRequestError).toBe(true);
    });
  });

  describe('ConflictError', () => {
    it('should create with correct status code 409', () => {
      const error = new ConflictError('Resource already exists');

      expect(error.code).toBe('CONFLICT');
      expect(error.statusCode).toBe(409);
      expect(error instanceof ConflictError).toBe(true);
    });
  });

  describe('UnauthorizedError', () => {
    it('should create with correct status code 401', () => {
      const error = new UnauthorizedError();

      expect(error.code).toBe('UNAUTHORIZED');
      expect(error.statusCode).toBe(401);
      expect(error instanceof UnauthorizedError).toBe(true);
    });
  });

  describe('ForbiddenError', () => {
    it('should create with correct status code 403', () => {
      const error = new ForbiddenError();

      expect(error.code).toBe('FORBIDDEN');
      expect(error.statusCode).toBe(403);
      expect(error instanceof ForbiddenError).toBe(true);
    });
  });

  describe('InternalServerError', () => {
    it('should create with correct status code 500', () => {
      const error = new InternalServerError();

      expect(error.code).toBe('INTERNAL_SERVER_ERROR');
      expect(error.statusCode).toBe(500);
      expect(error instanceof InternalServerError).toBe(true);
    });
  });
});
