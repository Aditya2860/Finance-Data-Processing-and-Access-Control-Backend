const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.transaction.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create 3 users with different roles
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash: hashedPassword,
      role: 'ADMIN',
    },
  });

  const analyst = await prisma.user.create({
    data: {
      name: 'Analyst User',
      email: 'analyst@example.com',
      passwordHash: hashedPassword,
      role: 'ANALYST',
    },
  });

  const viewer = await prisma.user.create({
    data: {
      name: 'Viewer User',
      email: 'viewer@example.com',
      passwordHash: hashedPassword,
      role: 'VIEWER',
    },
  });

  // Create sample transactions linked to admin
  await prisma.transaction.createMany({
    data: [
      {
        amount: 5000,
        type: 'INCOME',
        category: 'Salary',
        date: new Date('2024-01-15'),
        notes: 'January salary',
        userId: admin.id,
      },
      {
        amount: 1200,
        type: 'EXPENSE',
        category: 'Rent',
        date: new Date('2024-01-20'),
        notes: 'Monthly rent',
        userId: admin.id,
      },
      {
        amount: 300,
        type: 'EXPENSE',
        category: 'Food',
        date: new Date('2024-01-22'),
        notes: 'Groceries',
        userId: admin.id,
      },
      {
        amount: 800,
        type: 'INCOME',
        category: 'Freelance',
        date: new Date('2024-02-01'),
        notes: 'Side project payment',
        userId: analyst.id,
      },
    ],
  });

  console.log('Seed complete. Users created:');
  console.log('  admin@example.com / password123 (ADMIN)');
  console.log('  analyst@example.com / password123 (ANALYST)');
  console.log('  viewer@example.com / password123 (VIEWER)');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
