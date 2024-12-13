// errors/BaseError.js
class BaseError extends Error {
    constructor(name, statusCode, isOperational, message, errors = []) {
      super(message);
  
      Object.setPrototypeOf(this, new.target.prototype); // Restore prototype chain
      this.name = name; // Name of the error (e.g., "ValidationError")
      this.statusCode = statusCode; // HTTP status code
      this.isOperational = isOperational; // Distinguish expected vs. unexpected errors
      this.errors = errors; // Array of error details for further specificity
  
      Error.captureStackTrace(this);
    }
  }
  
  module.exports = BaseError;
  