/**
 * Standard API response structure
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Description of the response
 * @param {Object|Array|null} data - Payload data, can be an object, array, or null
 * @param {Array|null} errors - List of errors, if any
 */

const getISTTimestamp = () => {
    const date = new Date();
    const options = {
      timeZone: 'Asia/Kolkata',
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    return date.toLocaleString('en-IN', options);
  };
  
  const customResponse = ({
    res,
    statusCode = 200,
    message = 'Success',
    payload = null,
    errors = null,
  }) => {
    const success = statusCode >= 200 && statusCode < 300;
    const response = {
      success,
      status: statusCode,
      message,
      timestamp: getISTTimestamp(),
      payload,
      errors,
    };
  
    res.status(statusCode).json(response);
  };
  
  module.exports = customResponse;
  