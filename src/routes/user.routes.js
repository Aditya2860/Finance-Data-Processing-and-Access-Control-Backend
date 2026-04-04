const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const {
  authenticate,
  requireRole,
  requireActive,
} = require('../middleware/auth.middleware');

// All user routes need a valid token + active account
router.use(authenticate);
router.use(requireActive);

// GET /api/users — ADMIN only
router.get('/', requireRole(['ADMIN']), userController.getAllUsers);

// GET /api/users/me — any logged-in user can see their own profile
router.get('/me', userController.getMe);

// GET /api/users/:id — ADMIN only
router.get('/:id', requireRole(['ADMIN']), userController.getUserById);

// PATCH /api/users/:id — ADMIN only
router.patch('/:id', requireRole(['ADMIN']), userController.updateUser);

// DELETE /api/users/:id — ADMIN only
router.delete('/:id', requireRole(['ADMIN']), userController.deleteUser);

module.exports = router;
