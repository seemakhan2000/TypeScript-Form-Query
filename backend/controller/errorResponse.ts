export class BaseError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFound extends BaseError {
  constructor(message: string = "Not Found") {
    super(message, 404);
  }
}

export class ValidationError extends BaseError {
  constructor(message: string = "Validation Error") {
    super(message, 422);
  }
}

export class InvalidRequest extends BaseError {
  constructor(message: string = "Invalid Request") {
    super(message, 422);
  }
}

export class UserExistsError extends BaseError {
  constructor(message: string = "User already exists") {
    super(message, 409);
  }
}

export class UserNotFoundError extends BaseError {
  constructor(message: string = "User not found") {
    super(message, 404);
  }
}

export class InvalidPasswordError extends BaseError {
  constructor(message: string = "Invalid password") {
    super(message, 401);
  }
}

export class InvalidIDError extends BaseError {
  constructor(message: string = "Invalid User ID") {
    super(message, 400);
  }
}
