const express = require('express');
const router = express.Router();
const recordController = require('../controllers/record.controller');
const {
  authenticate,
  requireRole,
  requireActive,
} = require('../middleware/auth.middleware');

// All record routes require a valid token + active account
router.use(authenticate);
router.use(requireActive);

// POST /api/records — ADMIN only
router.post('/', requireRole(['ADMIN']), recordController.createRecord);

// GET /api/records — ALL roles
router.get('/', requireRole(['ADMIN', 'ANALYST', 'VIEWER']), recordController.listRecords);

// GET /api/records/:id — ALL roles
router.get('/:id', requireRole(['ADMIN', 'ANALYST', 'VIEWER']), recordController.getRecordById);

// PATCH /api/records/:id — ADMIN only
router.patch('/:id', requireRole(['ADMIN']), recordController.updateRecord);

// DELETE /api/records/:id — ADMIN only
router.delete('/:id', requireRole(['ADMIN']), recordController.deleteRecord);

module.exports = router;
