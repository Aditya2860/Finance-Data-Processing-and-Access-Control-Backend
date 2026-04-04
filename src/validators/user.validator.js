const { z } = require('zod');

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.enum(['VIEWER', 'ANALYST', 'ADMIN']).optional(),
  isActive: z.boolean().optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided' }
);

module.exports = { updateUserSchema };
