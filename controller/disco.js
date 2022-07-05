const { readCSVFile, imageUploads } = require('../helpers/fileConcern');
const asyncHandler = require('../middleware/asyncHandler');
const Metering = require('../model/Meter_Data');
const ErrorCatcher = require('../utils/errorCatcher');
const ControllerProcess = require('./Controller');

exports.getDiscoItems = asyncHandler(async (req, res, next) => {
  return await ControllerProcess({ req, res, next });
});

exports.getDiscoItem = asyncHandler(async (req, res, next) => {
  return await ControllerProcess({ req, res, next });
});

exports.createDiscoItem = asyncHandler(async (req, res, next) => {
  return await ControllerProcess({ req, res, next });
});

exports.updateDiscoItem = asyncHandler(async (req, res, next) => {
  return await ControllerProcess({ req, res, next });
});

exports.uploadCsvFiles = asyncHandler(async (req, res, next) => {
  return await readCSVFile({ req, res, next });
});

exports.DiscoSnapShotImage = asyncHandler(async (req, res, next) => {
  const store = await imageUploads({
    req,
    field: 'disco_snap_shot',
    searchParams: 'meter_number',
    schema: Metering,
  });
  if (store.error) return next(new ErrorCatcher(store.error, store.code));

  res.status(200).json({
    success: true,
    data: 'Image uploaded successfully...',
  });
});

exports.beforeInstallationImage = asyncHandler(async (req, res, next) => {
  const store = await imageUploads({
    req,
    field: 'before_installation_image',
    searchParams: 'meter_number',
    schema: Metering,
  });
  if (store.error) return next(new ErrorCatcher(store.error, store.code));

  res.status(200).json({
    success: true,
    data: 'Image uploaded successfully...',
  });
});

exports.afterInstallationImage = asyncHandler(async (req, res, next) => {
  const store = await imageUploads({
    req,
    field: 'after_installation_image',
    searchParams: 'meter_number',
    schema: Metering,
  });
  if (store.error) return next(new ErrorCatcher(store.error, store.code));

  res.status(200).json({
    success: true,
    data: 'Image uploaded successfully...',
  });
});
