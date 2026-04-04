const { AppError } = require('../utils/errors');

// Handles Prisma-specific errors and converts them to AppErrors
const handlePrismaError = (err) => {
  switch (err.code) {
    case 'P2002':
      // Unique constraint violation (e.g., duplicate email)
      const field = err.meta?.target?.[0] || 'field';
      return new AppError(`${field} already exists`, 409);

    case 'P2025':
      // Record not found
      return new AppError('Record not found', 404);

    case 'P2003':
      // Foreign key constraint failed
      return new AppError('Related record not found', 400);

    case 'P2014':
      // Relation violation
      return new AppError('Invalid relation data', 400);

    default:
      return new AppError('Database error occurred', 500);
  }
};

// Handles JWT errors
const handleJWTError = (err) => {
  if (err.name === 'JsonWebTokenError') {
    return new AppError('Invalid token', 401);
  }
  if (err.name === 'TokenExpiredError') {
    return new AppError('Token has expired. Please log in again.', 401);
  }
  return new AppError('Authentication failed', 401);
};

// ─────────────────────────────────────────
// GLOBAL ERROR HANDLER
// Must have 4 params (err, req, res, next)
// Express identifies it as error middleware
// ─────────────────────────────────────────
const globalErrorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('ERROR:', {
      message: err.message,
      stack: err.stack,
      code: err.code,
    });
  }

  // Convert known error types
  if (err.code?.startsWith('P')) {
    error = handlePrismaError(err);
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    error = handleJWTError(err);
  }

  // Zod validation error
  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // Final response — operational errors show their message
  // Unknown errors show generic message (security)
  const isOperational = error.isOperational || false;

  return res.status(error.statusCode || 500).json({
    success: false,
    error: isOperational ? error.message : 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && !isOperational
      ? { debug: err.message, stack: err.stack }
      : {}),
  });
};

// Handles unknown routes
const notFoundHandler = (req, res) => {
  return res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found`,
  });
};

module.exports = { globalErrorHandler, notFoundHandler };
