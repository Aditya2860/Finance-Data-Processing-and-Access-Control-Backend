const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require('../services/user.service');
const { updateUserSchema } = require('../validators/user.validator');
const { sendSuccess } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');
const { ValidationError } = require('../utils/errors');

// ─────────────────────────────────────────
// GET ALL USERS
// ─────────────────────────────────────────
const getAllUsersController = asyncHandler(async (req, res) => {
  const users = await getAllUsers();
  return sendSuccess(res, users);
});

// ─────────────────────────────────────────
// GET OWN PROFILE
// ─────────────────────────────────────────
const getMeController = asyncHandler(async (req, res) => {
  const user = await getUserById(req.user.id);
  return sendSuccess(res, user);
});

// ─────────────────────────────────────────
// GET USER BY ID
// ─────────────────────────────────────────
const getUserByIdController = asyncHandler(async (req, res) => {
  const user = await getUserById(req.params.id);
  return sendSuccess(res, user);
});

// ─────────────────────────────────────────
// UPDATE USER
// ─────────────────────────────────────────
const updateUserController = asyncHandler(async (req, res) => {
  const parsed = updateUserSchema.safeParse(req.body);
  if (!parsed.success) {
    throw parsed.error;
  }
  const updated = await updateUser(req.params.id, parsed.data);
  return sendSuccess(res, updated);
});

// ─────────────────────────────────────────
// DELETE USER
// ─────────────────────────────────────────
const deleteUserController = asyncHandler(async (req, res) => {
  if (req.params.id === req.user.id) {
    throw new ValidationError('You cannot delete your own account.');
  }
  const result = await deleteUser(req.params.id);
  return sendSuccess(res, result);
});

module.exports = {
  getAllUsers: getAllUsersController,
  getMe: getMeController,
  getUserById: getUserByIdController,
  updateUser: updateUserController,
  deleteUser: deleteUserController,
};
