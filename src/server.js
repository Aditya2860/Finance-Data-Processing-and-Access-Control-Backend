require('dotenv').config();
const http = require('http');
const app = require('./app');
const prisma = require('./utils/prisma');

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.BIND_HOST || '0.0.0.0';

async function start() {
  try {
    await prisma.$connect();
    console.log('Database: OK (Prisma connected)');
  } catch (err) {
    console.error('Database: FAILED —', err.message);
    console.error('Fix: check DATABASE_URL in .env, then run: npx prisma migrate dev && npx prisma generate');
    process.exit(1);
  }

  const server = http.createServer(app);

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Close the other app or set PORT=3001 in .env`);
    } else {
      console.error('Server error:', err.message);
    }
    process.exit(1);
  });

  server.listen(PORT, HOST, () => {
    console.log(`API:     http://127.0.0.1:${PORT}  (open /health in browser)`);
    console.log(`API:     http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Startup failed:', err);
  process.exit(1);
});
