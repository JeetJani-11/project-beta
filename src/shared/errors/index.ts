import { CustomError } from './CustomError';

/**
 * Export CustomError for external use
 */
export { CustomError };

/**
 * ValidationError: Thrown when request validation fails
 * HTTP Status: 400 Bad Request
 */
export class ValidationError extends CustomError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('VALIDATION_ERROR', message, 400, details);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * NotFoundError: Thrown when resource is not found
 * HTTP Status: 404 Not Found
 */
export class NotFoundError extends CustomError {
  constructor(resource: string, id?: string | number) {
    const message = id ? `${resource} with id ${id} not found` : `${resource} not found`;
    super('NOT_FOUND', message, 404);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * BadRequestError: Thrown for invalid requests
 * HTTP Status: 400 Bad Request
 */
export class BadRequestError extends CustomError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('BAD_REQUEST', message, 400, details);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

/**
 * ConflictError: Thrown when request conflicts with existing data
 * HTTP Status: 409 Conflict
 */
export class ConflictError extends CustomError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('CONFLICT', message, 409, details);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

/**
 * UnauthorizedError: Thrown when authentication fails
 * HTTP Status: 401 Unauthorized
 */
export class UnauthorizedError extends CustomError {
  constructor(message: string = 'Unauthorized') {
    super('UNAUTHORIZED', message, 401);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

/**
 * ForbiddenError: Thrown when user lacks permission
 * HTTP Status: 403 Forbidden
 */
export class ForbiddenError extends CustomError {
  constructor(message: string = 'Forbidden') {
    super('FORBIDDEN', message, 403);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

/**
 * InternalServerError: Thrown for unexpected server errors
 * HTTP Status: 500 Internal Server Error
 */
export class InternalServerError extends CustomError {
  constructor(message: string = 'Internal server error', details?: Record<string, unknown>) {
    super('INTERNAL_SERVER_ERROR', message, 500, details);
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}
