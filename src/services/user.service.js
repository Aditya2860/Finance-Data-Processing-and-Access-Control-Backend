const prisma = require('../utils/prisma');

const getAllUsers = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      // never return passwordHash
    },
    orderBy: { createdAt: 'desc' },
  });
};

const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  if (!user) throw new Error('User not found');
  return user;
};

const updateUser = async (id, updateData) => {
  // Check user exists first
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) throw new Error('User not found');

  const updated = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      updatedAt: true,
    },
  });

  return updated;
};

const deleteUser = async (id) => {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) throw new Error('User not found');

  await prisma.user.delete({ where: { id } });
  return { message: 'User deleted successfully' };
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };
