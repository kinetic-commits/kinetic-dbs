const ErrorCatcher = require('../utils/errorCatcher');
const asyncHandler = require('../middleware/asyncHandler');
const CreateOtherUserInfo = require('../model/OtherUserInfo');
const User = require('../model/UserData');
const ControllerProcess = require('./Controller');

//method    GET/api/v1/user
//desc      Get all users info
//access    Private & Admin Only
exports.getUsers = asyncHandler(async (req, res, next) => {
  const rs = await ControllerProcess({ req, res, next });
  if (!rs.success) return next(new ErrorCatcher(rs.error, rs.code));

  res.status(200).json({
    success: true,
    data: rs.data,
  });
});

//method    GET/api/v1/user/:1d
//desc      Get all users info
//access    Private
exports.getUser = asyncHandler(async (req, res, next) => {
  const rs = await ControllerProcess({ req, res, next });
  if (!rs.success) return next(new ErrorCatcher(rs.error, rs.code));

  res.status(200).json({
    success: true,
    data: rs.data,
  });
});

//method    POST/api/v1/user
//desc      Get all users info
//access    Private
exports.createUser = asyncHandler(async (req, res, next) => {
  const rs = await ControllerProcess({ req, res, next });
  if (!rs.success) return next(new ErrorCatcher(rs.error, rs.code));
  CookieConfig(User, 200, res);
});

//method    POST/api/v1/user
//desc      Login in
//access    Private
exports.loginUser = asyncHandler(async (req, res, next) => {
  const rs = await ControllerProcess({ req, res, next });
  if (!rs.success) return next(new ErrorCatcher(rs.error, rs.code));
  CookieConfig(User, 200, res);
});

//method    PUT/api/v1/user/:1d
//desc      Update users Operations
//access    Private
exports.updateUserInfo = asyncHandler(async (req, res, next) => {
  const { hasId, name } = req.QUERIES;

  const user = await User.findOne(`where ${name || 'email'} = '${hasId}'`);

  if (!user)
    return next(new ErrorCatcher('No result found with key ID provided', 404));

  const rs = await User.UpdateDocument(hasId, req.body);

  res.status(200).json({
    success: true,
    data: rs,
  });
});

//method    GET/api/v1/user
//desc      Log user out
//access    Private & Admin Only
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date((Date.now() + 10) * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
});

exports.createPassportImage = asyncHandler(async (req, res, next) => {
  const store = await imageUploads({
    req,
    schema: CreateUserData,
    searchParams: 'email',
    field: 'passport_url',
    table: 'user_data',
    action: CreateOtherUserInfo,
  });

  if (store.error) return next(new ErrorCatcher(store.error, store.code));

  res.status(200).json({
    success: true,
    data: store,
  });
});

// Cookie Config
const CookieConfig = (user, statusCode, res) => {
  //Get token from user model
  const token = user.userSignature();
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * (24 * 60) * (60 * 1000)
    ),
    httpOnly: true,
  };

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    data: token,
  });
};
