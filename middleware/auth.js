const jwt = require('jsonwebtoken');
const callEvent = require('../context/events/EmitEvent');
const magic_string = require('../context/events/Types');
const { OutGoingForUser } = require('../model/in_&_outs/OutgoingData');
const User = require('../model/UserData');
const CreateUserData = require('../model/UserData');
const ErrorCatcher = require('../utils/errorCatcher');
const asyncHandler = require('./asyncHandler');

exports.protect = asyncHandler(async (req, res, next) => {
  // Declaration of Important Variables
  const production = process.env.NODE_ENV === 'Production';
  const authorization = req.headers.authorization;
  const inHeader =
    authorization && authorization.startsWith('Bearer')
      ? authorization.split(' ')[1]
      : undefined;
  const cookie = req.cookie;
  const ismobile = false;

  let token;

  if (production) {
    if (ismobile) {
      token = inHeader;
    } else token = cookie.token;
  } else if (process.env.NODE_ENV === 'Development') {
    token = inHeader;
  } else next(new ErrorCatcher('No signature! Access denied', 409));

  try {
    const decode = jwt.verify(token, process.env.QQ);
    const user_info = await User.findOne(`where email='${decode._id}'`);
    if (!user_info)
      return next(
        new ErrorCatcher(
          'Authorization failed try relogging to your profile',
          401
        )
      );

    req.user = user_info;
    callEvent.emit(magic_string.QUERIES, req);
  } catch (error) {
    console.error(error);
    return next(
      new ErrorCatcher(
        'Authorization failed try relogging to your profile',
        401
      )
    );
  }
  next();
});
