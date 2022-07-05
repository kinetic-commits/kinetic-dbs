const { readCSVFile, imageUploads } = require('../helpers/fileConcern');
const asyncHandler = require('../middleware/asyncHandler');
const Form74 = require('../model/CustomerData');
const ErrorCatcher = require('../utils/errorCatcher');
const ControllerProcess = require('./Controller');

exports.getForm74s = asyncHandler(async (req, res, next) => {
  return await ControllerProcess({ req, res, next });
});

exports.getForm74 = asyncHandler(async (req, res, next) => {
  return await ControllerProcess({ req, res, next });
});

exports.createForm74 = asyncHandler(async (req, res, next) => {
  return await ControllerProcess({ req, res, next });
});

exports.updateForm74 = asyncHandler(async (req, res, next) => {
  return await ControllerProcess({ req, res, next });
});

exports.uploadCsvFiles = asyncHandler(async (req, res, next) => {
  return await readCSVFile({ req, dependencies: 'file', res, next });
});

exports.form74Image = asyncHandler(async (req, res, next) => {
  const store = await imageUploads({
    schema: Form74,
    searchParams: '_id',
    field: 'property_image',
    req,
  });

  if (store.error) return next(new ErrorCatcher(store.error, store.code));

  res.status(200).json({
    success: true,
    data: store,
  });
});
