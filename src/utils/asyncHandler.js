// Wraps async route handlers and forwards errors to global error handler
// Instead of try/catch in every route, just wrap the function
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = asyncHandler;
