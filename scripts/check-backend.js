#!/usr/bin/env node
/**
 * Run from the backend root: node scripts/check-backend.js
 * (or: npm run check)
 */
const path = require('path');
const fs = require('fs');

const root = path.join(__dirname, '..');
process.chdir(root);

console.log('Working directory:', root);
console.log('');

const envPath = path.join(root, '.env');
if (!fs.existsSync(envPath)) {
  console.error('MISSING: .env — copy .env.example to .env');
  process.exit(1);
}
console.log('OK: .env exists');

try {
  require('dotenv').config({ path: envPath });
} catch (e) {
  console.error('FAIL: dotenv', e.message);
  process.exit(1);
}

if (!fs.existsSync(path.join(root, 'node_modules', 'express'))) {
  console.error('MISSING: node_modules — run: npm install');
  process.exit(1);
}
console.log('OK: node_modules');

try {
  require(path.join(root, 'src', 'app'));
  console.log('OK: Express app loads');
} catch (e) {
  console.error('FAIL: app will not load —', e.message);
  console.error(e.stack);
  process.exit(1);
}

(async () => {
  const prisma = require(path.join(root, 'src', 'utils', 'prisma'));
  try {
    await prisma.$connect();
    const n = await prisma.user.count();
    console.log('OK: Database — User table readable, count =', n);
  } catch (e) {
    console.error('FAIL: Database —', e.message);
    console.error('Run: npx prisma migrate dev && npx prisma generate');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }

  console.log('');
  console.log('Next: npm start   then open http://localhost:3000/health');
})();
