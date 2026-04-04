const {
  createRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
} = require('../services/record.service');
const {
  createRecordSchema,
  updateRecordSchema,
  filterRecordSchema,
} = require('../validators/record.validator');
const { sendSuccess } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

// ─────────────────────────────────────────
// CREATE RECORD
// ─────────────────────────────────────────
const createRecordController = asyncHandler(async (req, res) => {
  const parsed = createRecordSchema.safeParse(req.body);
  if (!parsed.success) {
    throw parsed.error;
  }

  const record = await createRecord(parsed.data, req.user.id);
  return sendSuccess(res, record, 201);
});

// ─────────────────────────────────────────
// LIST RECORDS
// ─────────────────────────────────────────
const listRecordsController = asyncHandler(async (req, res) => {
  const parsed = filterRecordSchema.safeParse(req.query);
  if (!parsed.success) {
    throw parsed.error;
  }

  const result = await getAllRecords(parsed.data);
  return sendSuccess(res, result);
});

// ─────────────────────────────────────────
// GET RECORD BY ID
// ─────────────────────────────────────────
const getRecordByIdController = asyncHandler(async (req, res) => {
  const record = await getRecordById(req.params.id);
  return sendSuccess(res, record);
});

// ─────────────────────────────────────────
// UPDATE RECORD
// ─────────────────────────────────────────
const updateRecordController = asyncHandler(async (req, res) => {
  const parsed = updateRecordSchema.safeParse(req.body);
  if (!parsed.success) {
    throw parsed.error;
  }

  const record = await updateRecord(req.params.id, parsed.data);
  return sendSuccess(res, record);
});

// ─────────────────────────────────────────
// DELETE RECORD
// ─────────────────────────────────────────
const deleteRecordController = asyncHandler(async (req, res) => {
  const result = await deleteRecord(req.params.id);
  return sendSuccess(res, result);
});

module.exports = {
  createRecord: createRecordController,
  listRecords: listRecordsController,
  getRecordById: getRecordByIdController,
  updateRecord: updateRecordController,
  deleteRecord: deleteRecordController,
};
