/**
 * Centralized error handling utilities
 */

/**
 * Standardized error response format
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {Object} details - Additional error details
 * @param {Error} error - Original error object for logging
 */
const sendErrorResponse = (res, statusCode, message, details = null, error = null) => {
  // Log error for debugging
  if (error) {
    console.error(`Error ${statusCode}:`, error.message);
    console.error('Stack:', error.stack);
  }

  const response = {
    success: false,
    message,
    ...(details && { details }),
    ...(process.env.NODE_ENV === 'development' && error && { 
      stack: error.stack,
      originalError: error.message 
    })
  };

  return res.status(statusCode).json(response);
};

/**
 * Format validation errors from Mongoose
 * @param {Object} validationError - Mongoose validation error
 * @returns {Object} Formatted validation errors
 */
const formatValidationErrors = (validationError) => {
  const errors = {};
  
  if (validationError.errors) {
    Object.keys(validationError.errors).forEach(key => {
      const error = validationError.errors[key];
      errors[key] = {
        message: error.message,
        value: error.value,
        kind: error.kind
      };
    });
  }
  
  return {
    type: 'ValidationError',
    fields: errors,
    message: 'Validation failed for one or more fields'
  };
};

/**
 * Handle different types of errors and send appropriate responses
 * @param {Object} res - Express response object
 * @param {Error} error - Error object
 * @param {string} defaultMessage - Default error message
 */
const handleError = (res, error, defaultMessage = 'An error occurred') => {
  console.error('Error occurred:', error);

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const validationDetails = formatValidationErrors(error);
    return sendErrorResponse(res, 400, 'Validation failed', validationDetails, error);
  }

  // Mongoose cast error (invalid ObjectId, etc.)
  if (error.name === 'CastError') {
    return sendErrorResponse(res, 400, 'Invalid data format', { field: error.path, value: error.value }, error);
  }

  // Mongoose duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return sendErrorResponse(res, 409, `${field} already exists`, { field, value: error.keyValue[field] }, error);
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return sendErrorResponse(res, 401, 'Invalid token', null, error);
  }

  if (error.name === 'TokenExpiredError') {
    return sendErrorResponse(res, 401, 'Token expired', null, error);
  }

  // Default server error
  return sendErrorResponse(res, 500, defaultMessage, null, error);
};

/**
 * Success response helper
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {Object} data - Response data
 */
const sendSuccessResponse = (res, statusCode = 200, message = 'Success', data = null) => {
  const response = {
    success: true,
    message,
    ...(data && { data })
  };

  return res.status(statusCode).json(response);
};

/**
 * Not found response helper
 * @param {Object} res - Express response object
 * @param {string} resource - Resource name that was not found
 */
const sendNotFoundResponse = (res, resource = 'Resource') => {
  return sendErrorResponse(res, 404, `${resource} not found`);
};

module.exports = {
  sendErrorResponse,
  formatValidationErrors,
  handleError,
  sendSuccessResponse,
  sendNotFoundResponse
};