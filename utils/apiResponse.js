/**
 * Standard API Success Response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code (default: 200)
 * @param {string} message - Human-readable success message
 * @param {any} data - Response payload
 */
export const sendSuccess = (
  res,
  statusCode = 200,
  message = "Success",
  data = null
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Standard API Error Response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {string} message - Human-readable error message
 * @param {any} error - Detailed error payload or error string
 */
export const sendError = (
  res,
  statusCode = 500,
  message = "An error occurred",
  error = null
) => {
  const errorDetails =
    error instanceof Error
      ? error.message
      : typeof error === "string"
      ? error
      : undefined;

  return res.status(statusCode).json({
    success: false,
    message,
    ...(errorDetails ? { error: errorDetails } : {}),
  });
};

export default {
  sendSuccess,
  sendError,
};
