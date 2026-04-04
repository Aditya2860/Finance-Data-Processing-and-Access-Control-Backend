const { z } = require('zod');

const createRecordSchema = z.object({
  amount: z
    .number({ invalid_type_error: 'Amount must be a number' })
    .positive('Amount must be greater than 0')
    .multipleOf(0.01, 'Amount can have at most 2 decimal places'),

  type: z.enum(['INCOME', 'EXPENSE'], {
    errorMap: () => ({ message: 'Type must be INCOME or EXPENSE' }),
  }),

  category: z
    .string()
    .min(1, 'Category is required')
    .max(50, 'Category must be under 50 characters'),

  date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid date format. Use YYYY-MM-DD',
    })
    .transform((val) => new Date(val)), // converts string to Date object

  notes: z
    .string()
    .max(255, 'Notes must be under 255 characters')
    .optional(),
});

const updateRecordSchema = z.object({
  amount: z
    .number()
    .positive('Amount must be greater than 0')
    .multipleOf(0.01)
    .optional(),

  type: z.enum(['INCOME', 'EXPENSE']).optional(),

  category: z
    .string()
    .min(1)
    .max(50)
    .optional(),

  date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid date format',
    })
    .transform((val) => new Date(val))
    .optional(),

  notes: z.string().max(255).optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided to update' }
);

// Query params validator for GET /records
const filterRecordSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  category: z.string().optional(),
  from: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid from date' })
    .optional(),
  to: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid to date' })
    .optional(),
  page: z
    .string()
    .transform(Number)
    .refine((n) => n > 0, { message: 'Page must be >= 1' })
    .optional(),
  limit: z
    .string()
    .transform(Number)
    .refine((n) => n > 0 && n <= 100, { message: 'Limit must be 1–100' })
    .optional(),
});

module.exports = { createRecordSchema, updateRecordSchema, filterRecordSchema };
