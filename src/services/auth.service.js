const bcrypt = require('bcryptjs');
const prisma = require('../utils/prisma');
const { generateToken } = require('../utils/jwt');
const { ConflictError, UnauthorizedError } = require('../utils/errors');

const register = async ({ name, email, password, role }) => {
  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ConflictError('Email already registered');
  }

  // Hash the password
  const passwordHash = await bcrypt.hash(password, 10);

  // Create user in DB
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: role || 'VIEWER',
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      // passwordHash intentionally excluded
    },
  });

  // Generate JWT token
  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return { user, token };
};

const login = async ({ email, password }) => {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Check if user is active
  if (!user.isActive) {
    throw new UnauthorizedError('Account is deactivated. Contact admin.');
  }

  // Generate JWT token
  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    },
    token,
  };
};

module.exports = { register, login };
