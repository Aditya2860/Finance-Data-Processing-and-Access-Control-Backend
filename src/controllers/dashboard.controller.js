const {
  getSummary,
  getCategoryBreakdown,
  getMonthlyTrends,
  getRecentActivity,
  getFullDashboard,
} = require('../services/dashboard.service');
const { sendSuccess } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');
const { ValidationError } = require('../utils/errors');

// ─────────────────────────────────────────
// FULL DASHBOARD
// ─────────────────────────────────────────
const getFullDashboardController = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const result = await getFullDashboard({ from, to });
  return sendSuccess(res, result);
});

// ─────────────────────────────────────────
// SUMMARY
// ─────────────────────────────────────────
const getSummaryController = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const result = await getSummary({ from, to });
  return sendSuccess(res, result);
});

// ─────────────────────────────────────────
// CATEGORY BREAKDOWN
// ─────────────────────────────────────────
const getCategoryBreakdownController = asyncHandler(async (req, res) => {
  const { from, to, type } = req.query;

  if (type && !['INCOME', 'EXPENSE'].includes(type)) {
    throw new ValidationError('Type must be INCOME or EXPENSE');
  }

  const result = await getCategoryBreakdown({ from, to, type });
  return sendSuccess(res, result);
});

// ─────────────────────────────────────────
// TRENDS
// ─────────────────────────────────────────
const getTrendsController = asyncHandler(async (req, res) => {
  let { months = 6 } = req.query;
  months = parseInt(months);

  if (isNaN(months) || months < 1 || months > 24) {
    throw new ValidationError('months must be between 1 and 24');
  }

  const result = await getMonthlyTrends({ months });
  return sendSuccess(res, result);
});

// ─────────────────────────────────────────
// RECENT ACTIVITY
// ─────────────────────────────────────────
const getRecentActivityController = asyncHandler(async (req, res) => {
  let { limit = 10 } = req.query;
  limit = parseInt(limit);

  if (isNaN(limit) || limit < 1 || limit > 50) {
    throw new ValidationError('limit must be between 1 and 50');
  }

  const result = await getRecentActivity({ limit });
  return sendSuccess(res, result);
});

module.exports = {
  getFullDashboard: getFullDashboardController,
  getSummary: getSummaryController,
  getCategoryBreakdown: getCategoryBreakdownController,
  getTrends: getTrendsController,
  getRecentActivity: getRecentActivityController,
};
