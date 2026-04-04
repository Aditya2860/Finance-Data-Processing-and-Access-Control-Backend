const ROLES = {
  VIEWER: 'VIEWER',
  ANALYST: 'ANALYST',
  ADMIN: 'ADMIN',
};

// Role hierarchy — useful for "at least analyst" checks
const ROLE_HIERARCHY = {
  VIEWER: 1,
  ANALYST: 2,
  ADMIN: 3,
};

// Helper: check if a role meets minimum required level
const hasMinRole = (userRole, minRole) => {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minRole];
};

module.exports = { ROLES, ROLE_HIERARCHY, hasMinRole };
