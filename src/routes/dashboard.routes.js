const express = require('express');
const router  = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authenticate, requireRole, requireActive } = require('../middleware/auth.middleware');

// All dashboard routes need valid token + active account
router.use(authenticate);
router.use(requireActive);

// GET /api/dashboard — ADMIN + ANALYST only
router.get('/', requireRole(['ADMIN', 'ANALYST']), dashboardController.getFullDashboard);

// GET /api/dashboard/summary — ALL roles
router.get('/summary', requireRole(['ADMIN', 'ANALYST', 'VIEWER']), dashboardController.getSummary);

// GET /api/dashboard/categories — ADMIN + ANALYST only
router.get('/categories', requireRole(['ADMIN', 'ANALYST']), dashboardController.getCategoryBreakdown);

// GET /api/dashboard/trends — ADMIN + ANALYST only
router.get('/trends', requireRole(['ADMIN', 'ANALYST']), dashboardController.getTrends);

// GET /api/dashboard/recent — ALL roles
router.get('/recent', requireRole(['ADMIN', 'ANALYST', 'VIEWER']), dashboardController.getRecentActivity);

module.exports = router;
