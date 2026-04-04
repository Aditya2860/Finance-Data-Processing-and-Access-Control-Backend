const express = require('express');
const config = require('./config');
const { globalErrorHandler, notFoundHandler } = require('./middleware/error.middleware');
const { requestLogger } = require('./middleware/logger.middleware');

const app = express();

// ─── Core Middleware ───────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// ─── Health Check ──────────────────────────
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Finance API is running',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// ─── Routes ────────────────────────────────
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/records', require('./routes/record.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));

// ─── Error Handling ────────────────────────
app.use(notFoundHandler);
app.use(globalErrorHandler);

module.exports = app;