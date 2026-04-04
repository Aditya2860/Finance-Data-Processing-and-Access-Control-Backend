// Simple request logger — shows every incoming request
const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Log when response finishes
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusColor =
      res.statusCode >= 500 ? '\x1b[31m' : // red
      res.statusCode >= 400 ? '\x1b[33m' : // yellow
      res.statusCode >= 200 ? '\x1b[32m' : // green
      '\x1b[0m';

    console.log(
      `${statusColor}${req.method}\x1b[0m ${req.originalUrl} → ${statusColor}${res.statusCode}\x1b[0m [${duration}ms]`
    );
  });

  next();
};

module.exports = { requestLogger };
