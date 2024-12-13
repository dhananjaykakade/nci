const BaseError = require('./baseError.js');

class ApiError extends BaseError {
  constructor(
    message = 'Internal Server Error',
    statusCode = 500,
    errors = []
  ) {
    super('ApiError', statusCode, true, message, errors);
  }
}

class NotFoundError extends BaseError {
  constructor(resource = 'Resource') {
    super('NotFoundError', 404, true, `${resource} not found`);
  }
}

class ValidationError extends BaseError {
  constructor(errors = []) {
    super('ValidationError', 400, true, 'Invalid request data', errors);
  }
}

module.exports = {
  ApiError,
  NotFoundError,
  ValidationError,
};
