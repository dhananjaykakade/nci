/* eslint-disable no-unused-vars */

const logger = require( '../utils/winston.js');
const { ApiError }  = require( '../utils/customError.js');


const errorHandler = (err, req, res, _next) => {
  if (!(err instanceof ApiError)) {
    err = new ApiError('Something went wrong', 500);
  }

  // Log the error details
  logger.error({
    errorName: err.name,
    message: err.message || 'Something went wrong',
    statusCode: err.statusCode,
    stack: err.stack || [],
    errors: err.errors || [],
  });

  // Send error response
  res.status(err.statusCode).json({
    statusCode: err.statusCode,
    message: err.message || 'Something went wrong',
    errors: err.errors,
    stack: err.stack || [],
  });
};

module.exports = errorHandler;
