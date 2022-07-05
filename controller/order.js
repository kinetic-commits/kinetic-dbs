const asyncHandler = require('../middleware/asyncHandler');
const ControllerProcess = require('./Controller');

exports.getOrders = asyncHandler(async (req, res, next) => {
  return await ControllerProcess({ req, res, next });
});

exports.getOrder = asyncHandler(async (req, res, next) => {
  return await ControllerProcess({ req, res, next });
});

exports.createOrder = asyncHandler(async (req, res, next) => {
  return await ControllerProcess({ req, res, next });
});

exports.updateOrder = asyncHandler(async (req, res, next) => {
  return await ControllerProcess({ req, res, next });
});
