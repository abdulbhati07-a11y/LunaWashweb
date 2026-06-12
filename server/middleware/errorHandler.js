/**
 * Centralised error handler
 * Catches anything thrown inside async route handlers.
 */

// Wrap async route handlers so errors propagate to Express error middleware
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// 404 handler — must be registered after all routes
export function notFound(_req, res) {
  res.status(404).json({ message: 'Route not found.' });
}

// Global error handler — must be registered last (4 arguments)
export function errorHandler(err, _req, res, _next) {
  const isDev = process.env.NODE_ENV !== 'production';

  console.error('[ERROR]', err.message, isDev ? err.stack : '');

  const status = err.status || err.statusCode || 500;
  const message =
    status < 500
      ? err.message
      : 'An unexpected error occurred. Please try again later.';

  res.status(status).json({ message, ...(isDev && { stack: err.stack }) });
}
