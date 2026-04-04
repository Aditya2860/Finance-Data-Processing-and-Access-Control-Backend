const { verifyToken } = require('../utils/jwt');
const { sendError } = require('../utils/response');
const { ROLE_HIERARCHY } = require('../utils/roles');
const prisma = require('../utils/prisma');

// ─────────────────────────────────────────
// Middleware 1: Verify JWT token
// Attaches decoded user to req.user
// ─────────────────────────────────────────
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Access denied. No token provided.', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    // req.user is now available in all downstream middleware and route handlers
    req.user = decoded; // { id, email, role }
    next();
  } catch (err) {
    return sendError(res, 'Invalid or expired token.', 401);
  }
};

// ─────────────────────────────────────────
// Middleware 2: Role-based access control
// Usage: requireRole(['ADMIN'])
//        requireRole(['ADMIN', 'ANALYST'])
// ─────────────────────────────────────────
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    // authenticate must run before requireRole
    if (!req.user) {
      return sendError(res, 'Authentication required.', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. Required role: ${allowedRoles.join(' or ')}`,
        403
      );
    }

    next();
  };
};

// ─────────────────────────────────────────
// Middleware 3: Check if user is active
// Prevents deactivated users from acting
// ─────────────────────────────────────────
const requireActive = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { isActive: true },
    });

    if (!user || !user.isActive) {
      return sendError(res, 'Account is deactivated. Contact admin.', 403);
    }

    next();
  } catch (err) {
    return sendError(res, 'Authorization check failed.', 500);
  }
};

// ─────────────────────────────────────────
// Middleware 4: Hierarchy-based access control
// Usage: requireMinRole('ANALYST')
// ─────────────────────────────────────────
const requireMinRole = (minRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required.', 401);
    }

    const userLevel = ROLE_HIERARCHY[req.user.role] || 0;
    const requiredLevel = ROLE_HIERARCHY[minRole] || 0;

    if (userLevel < requiredLevel) {
      return sendError(
        res,
        `Access denied. Minimum required role: ${minRole}`,
        403
      );
    }

    next();
  };
};

module.exports = { authenticate, requireRole, requireActive, requireMinRole };
