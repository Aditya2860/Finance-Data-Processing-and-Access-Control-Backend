const { register, login } = require('../services/auth.service');
const { registerSchema, loginSchema } = require('../validators/auth.validator');
const { sendSuccess } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

// ─────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────
const registerController = asyncHandler(async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    throw parsed.error;
  }

  const result = await register(parsed.data);
  return sendSuccess(res, result, 201);
});

// ─────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────
const loginController = asyncHandler(async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw parsed.error;
  }

  const result = await login(parsed.data);
  return sendSuccess(res, result, 200);
});

module.exports = {
  register: registerController,
  login: loginController,
};
