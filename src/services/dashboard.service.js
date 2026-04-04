const prisma = require('../utils/prisma');

// ─────────────────────────────────────────
// SUMMARY — total income, expenses, balance
// ─────────────────────────────────────────
const getSummary = async (filters = {}) => {
  const { from, to } = filters;

  // Build optional date range filter
  const dateFilter = buildDateFilter(from, to);

  // Run all three aggregations in parallel
  const [incomeResult, expenseResult, recordCount] = await Promise.all([
    prisma.transaction.aggregate({
      where: { type: 'INCOME', ...dateFilter },
      _sum: { amount: true },
      _count: { id: true },
    }),
    prisma.transaction.aggregate({
      where: { type: 'EXPENSE', ...dateFilter },
      _sum: { amount: true },
      _count: { id: true },
    }),
    prisma.transaction.count({
      where: { ...dateFilter },
    }),
  ]);

  const totalIncome   = incomeResult._sum.amount  || 0;
  const totalExpenses = expenseResult._sum.amount || 0;
  const netBalance    = totalIncome - totalExpenses;

  return {
    totalIncome:    parseFloat(totalIncome.toFixed(2)),
    totalExpenses:  parseFloat(totalExpenses.toFixed(2)),
    netBalance:     parseFloat(netBalance.toFixed(2)),
    totalRecords:   recordCount,
    incomeCount:    incomeResult._count.id,
    expenseCount:   expenseResult._count.id,
    status:         netBalance >= 0 ? 'surplus' : 'deficit',
    ...(from || to ? { filteredFrom: from, filteredTo: to } : {}),
  };
};

// ─────────────────────────────────────────
// CATEGORY BREAKDOWN — totals per category
// ─────────────────────────────────────────
const getCategoryBreakdown = async (filters = {}) => {
  const { from, to, type } = filters;
  const dateFilter = buildDateFilter(from, to);

  const where = { ...dateFilter };
  if (type) where.type = type;

  // Group by category and sum amounts
  const grouped = await prisma.transaction.groupBy({
    by: ['category', 'type'],
    where,
    _sum: { amount: true },
    _count: { id: true },
    orderBy: { _sum: { amount: 'desc' } },
  });

  // Calculate grand total for percentage calculation
  const grandTotal = grouped.reduce(
    (sum, g) => sum + (g._sum.amount || 0),
    0
  );

  // Format response
  const breakdown = grouped.map((g) => ({
    category:   g.category,
    type:       g.type,
    total:      parseFloat((g._sum.amount || 0).toFixed(2)),
    count:      g._count.id,
    percentage: grandTotal > 0
      ? parseFloat(((g._sum.amount / grandTotal) * 100).toFixed(1))
      : 0,
  }));

  // Separate income categories vs expense categories
  const incomeCategories  = breakdown.filter((b) => b.type === 'INCOME');
  const expenseCategories = breakdown.filter((b) => b.type === 'EXPENSE');

  return {
    all: breakdown,
    income:   incomeCategories,
    expenses: expenseCategories,
  };
};

// ─────────────────────────────────────────
// MONTHLY TRENDS — income vs expense per month
// ─────────────────────────────────────────
const getMonthlyTrends = async (filters = {}) => {
  const { months = 6 } = filters; // default last 6 months

  // Calculate start date — N months ago from today
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - (months - 1));
  startDate.setDate(1);
  startDate.setHours(0, 0, 0, 0);

  // Fetch all records in the date range
  const records = await prisma.transaction.findMany({
    where: {
      date: { gte: startDate },
    },
    select: {
      amount: true,
      type:   true,
      date:   true,
    },
    orderBy: { date: 'asc' },
  });

  // Group by year-month manually
  const monthMap = {};

  records.forEach((record) => {
    const d     = new Date(record.date);
    const year  = d.getFullYear();
    const month = d.getMonth() + 1; // 1-12
    const key   = `${year}-${String(month).padStart(2, '0')}`; // "2024-01"

    if (!monthMap[key]) {
      monthMap[key] = {
        month: key,
        label: d.toLocaleString('default', { month: 'short', year: 'numeric' }),
        income:   0,
        expenses: 0,
        net:      0,
        count:    0,
      };
    }

    if (record.type === 'INCOME') {
      monthMap[key].income += record.amount;
    } else {
      monthMap[key].expenses += record.amount;
    }
    monthMap[key].count += 1;
  });

  // Calculate net for each month and round values
  const trends = Object.values(monthMap).map((m) => ({
    ...m,
    income:   parseFloat(m.income.toFixed(2)),
    expenses: parseFloat(m.expenses.toFixed(2)),
    net:      parseFloat((m.income - m.expenses).toFixed(2)),
  }));

  // Fill in missing months with zeros
  const filledTrends = fillMissingMonths(startDate, trends, months);

  return {
    trends: filledTrends,
    period: `Last ${months} months`,
  };
};

// ─────────────────────────────────────────
// RECENT ACTIVITY — last N transactions
// ─────────────────────────────────────────
const getRecentActivity = async (filters = {}) => {
  const { limit = 10 } = filters;

  const records = await prisma.transaction.findMany({
    orderBy: { createdAt: 'desc' },
    take:    Math.min(limit, 50), // max 50
    include: {
      user: {
        select: { id: true, name: true },
      },
    },
  });

  return {
    records,
    count: records.length,
  };
};

// ─────────────────────────────────────────
// FULL DASHBOARD — all data in one call
// ─────────────────────────────────────────
const getFullDashboard = async (filters = {}) => {
  // Run all queries in parallel for speed
  const [summary, categories, trends, recent] = await Promise.all([
    getSummary(filters),
    getCategoryBreakdown(filters),
    getMonthlyTrends(filters),
    getRecentActivity({ limit: 5 }),
  ]);

  return {
    summary,
    categories,
    trends,
    recentActivity: recent,
    generatedAt: new Date().toISOString(),
  };
};

// ─────────────────────────────────────────
// HELPER: Build date filter object
// ─────────────────────────────────────────
const buildDateFilter = (from, to) => {
  if (!from && !to) return {};

  const dateFilter = { date: {} };
  if (from) dateFilter.date.gte = new Date(from);
  if (to)   dateFilter.date.lte = new Date(to);
  return dateFilter;
};

// ─────────────────────────────────────────
// HELPER: Fill months with no transactions as zero
// ─────────────────────────────────────────
const fillMissingMonths = (startDate, trends, months) => {
  const result    = [];
  const trendMap  = {};
  trends.forEach((t) => (trendMap[t.month] = t));

  for (let i = 0; i < months; i++) {
    const d = new Date(startDate);
    d.setMonth(d.getMonth() + i);

    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

    result.push(
      trendMap[key] || {
        month:    key,
        label:    d.toLocaleString('default', { month: 'short', year: 'numeric' }),
        income:   0,
        expenses: 0,
        net:      0,
        count:    0,
      }
    );
  }

  return result;
};

module.exports = {
  getSummary,
  getCategoryBreakdown,
  getMonthlyTrends,
  getRecentActivity,
  getFullDashboard,
};
