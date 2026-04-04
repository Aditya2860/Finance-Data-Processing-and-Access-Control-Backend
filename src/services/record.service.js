const prisma = require('../utils/prisma');
const { NotFoundError } = require('../utils/errors');

// ─────────────────────────────────────────
// CREATE a new transaction record
// ─────────────────────────────────────────
const createRecord = async (data, userId) => {
  return await prisma.transaction.create({
    data: {
      amount: data.amount,
      type: data.type,
      category: data.category,
      date: data.date,
      notes: data.notes || null,
      userId,
    },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });
};

// ─────────────────────────────────────────
// GET all records with filters + pagination
// ─────────────────────────────────────────
const getAllRecords = async (filters = {}) => {
  const {
    type,
    category,
    from,
    to,
    page = 1,
    limit = 10,
  } = filters;

  // Build dynamic where clause
  const where = {};

  if (type) where.type = type;

  if (category) {
    where.category = {
      contains: category, // partial match
    };
  }

  // Date range filter
  if (from || to) {
    where.date = {};
    if (from) where.date.gte = new Date(from); // greater than or equal
    if (to)   where.date.lte = new Date(to);   // less than or equal
  }

  // Pagination math
  const skip = (page - 1) * limit;

  // Run query + count in parallel for efficiency
  const [records, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' }, // newest first
      skip,
      take: limit,
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    records,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    },
  };
};

// ─────────────────────────────────────────
// GET single record by ID
// ─────────────────────────────────────────
const getRecordById = async (id) => {
  const record = await prisma.transaction.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (!record) throw new NotFoundError('Record not found');
  return record;
};

// ─────────────────────────────────────────
// UPDATE a record by ID
// ─────────────────────────────────────────
const updateRecord = async (id, updateData) => {
  // Check record exists first
  const existing = await prisma.transaction.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Record not found');

  return await prisma.transaction.update({
    where: { id },
    data: updateData,
    include: {
      user: {
        select: { id: true, name: true },
      },
    },
  });
};

// ─────────────────────────────────────────
// DELETE a record by ID
// ─────────────────────────────────────────
const deleteRecord = async (id) => {
  const existing = await prisma.transaction.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Record not found');

  await prisma.transaction.delete({ where: { id } });
  return { message: 'Record deleted successfully' };
};

module.exports = {
  createRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
};
