require('dotenv').config();
const prisma = require('./utils/prisma');

async function test() {
  try {
    const users = await prisma.user.findMany();
    console.log('Users in DB:', users);

    const transactions = await prisma.transaction.findMany({
      include: { user: true }, // join with user
    });
    console.log('Transactions:', transactions);
  } catch (error) {
    console.error('Database connection test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
