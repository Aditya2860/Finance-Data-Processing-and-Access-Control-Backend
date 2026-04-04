require('dotenv').config();

const config = {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret-for-dev-only',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  nodeEnv: process.env.NODE_ENV || 'development',
};

// Simple validation to fail fast if critical env vars are missing
if (!config.databaseUrl) {
  console.error('ERROR: DATABASE_URL is not set in environment');
  process.exit(1);
}

module.exports = config;
