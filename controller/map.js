const { isArray } = require('../helpers/essential');
const { readCSVFile, imageUploads } = require('../helpers/fileConcern');
const asyncHandler = require('../middleware/asyncHandler');
const Metering = require('../model/Meter_Data');
const ErrorCatcher = require('../utils/errorCatcher');
const ControllerProcess = require('./Controller');

exports.getMapItems = asyncHandler(async (req, res, next) => {
  return await ControllerProcess({ req, res, next });
});

exports.getMapItem = asyncHandler(async (req, res, next) => {
  return await ControllerProcess({ req, res, next });
});

exports.createMapItem = asyncHandler(async (req, res, next) => {
  return await ControllerProcess({ req, res, next });
});

exports.updateMapItem = asyncHandler(async (req, res, next) => {
  return await ControllerProcess({ req, res, next });
});

exports.uploadCsvFiles = asyncHandler(async (req, res, next) => {
  return await readCSVFile({ req, Schema: Metering, next, res });
});

exports.MapSnapShotImage = asyncHandler(async (req, res, next) => {
  const store = await imageUploads({
    req,
    field: 'map_snap_shot',
    searchParams: 'meter_number',
    schema: Metering,
  });
  if (store.error) return next(new ErrorCatcher(store.error, store.code));

  res.status(200).json({
    success: true,
    data: 'Image uploaded successfully...',
  });
});
