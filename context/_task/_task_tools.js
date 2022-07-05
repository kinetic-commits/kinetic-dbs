const { CREATE_URL } = require('../../helpers/Types');
const ErrorCatcher = require('../../utils/errorCatcher');
const { csvGetter } = require('../essentials/usables');

async function TryAndCatch(Schema, data, message, action = 'create') {
  try {
    const rs = await Schema[action](data);
    message.error = null;
    message.code = action === 'create' ? 201 : 200;
    message.data =
      action === 'create' ? (typeof rs !== 'string' ? rs.msg : rs) : rs;
    message.success = true;

    if ((action === 'find' && rs.length < 1) || (action === 'findOne' && !rs)) {
      message.error = 'No result found';
      message.code = 400;
      message.success = false;
    }
  } catch (error) {
    message.error = error.message;
    message.code = 400;
  }

  return message;
}

async function TryAndCatchUpdates(Schema, data, message, ID, parsed) {
  try {
    const verify = await TryAndCatch(Schema, parsed, message, 'findOne');
    if (!verify) throw new Error('No result found');
    const rs = await Schema.UpdateDocument(verify[ID], data);
    message.data = rs;
    message.code = 200;
    message.success = true;
    message.error = null;
  } catch (error) {
    message.error = error.message;
    message.code = 400;
  }

  return message;
}

const ResponseBack = ({ req, rs, res, next }) => {
  const { baseUrl } = req;
  if (baseUrl === CREATE_URL) {
    return rs;
  } else {
    if (!rs.success) return next(new ErrorCatcher(rs.error, rs.code));
    res.status(200).json({
      success: true,
      data: rs.data,
    });
  }
};

const sendError = ({ errorMsg, code = 400, message }) => {
  message.error = errorMsg || 'Access denied';
  message = code;

  return message;
};

const readFileAndReturnCSV = async (filePath, cb, message) => {
  try {
    const rs_ = await cb(filePath);
    const rs = csvGetter(rs_);
    message.data = rs;
    message.code = 400;
    message.success = true;
    message.error = null;
  } catch (error) {
    message.error = error.message;
    message.code = 400;
  }
};

const CheckMatches = (arr, original) => {
  const every = arr.every((d) => d.success);
  const some = arr.some((d) => d.success);
  const child = arr.length;
  const parent = original.length;
  const lengthMatch = parent === child;
  const passed = arr.filter((d) => d.success);
  const failed = arr.filter((d) => !d.success);
  if (every && lengthMatch) {
    return `All document processed successfully...`;
  } else if (some) {
    return `${passed.length} out of ${
      original.length - passed.length
    } processed while: ${JSON.stringify(failed)}`;
  } else if (!some && !every) {
    return `All document failed`;
  }

  return { allPassed: all, allFailed: all_failed, someFaild: notall, data };
};

module.exports = {
  TryAndCatch,
  ResponseBack,
  sendError,
  readFileAndReturnCSV,
  TryAndCatchUpdates,
  CheckMatches,
};
