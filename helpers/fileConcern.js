const path = require('path');
const fork = require('child_process').fork;
const fs = require('fs');
const { csvGetter } = require('./essential');
const { sendError } = require('../context/_task/_task_tools');
const ErrorCatcher = require('../utils/errorCatcher');

exports.readCSVFile = async ({ req, res, next }) => {
  const { user, files } = req || {};
  if (!user) return sendError({ message });
  if (!files) return sendError({ errorMsg: 'Please upload a file', message });
  const file = files.file;
  const time = Date.now();

  if (!file.mimetype === 'text/csv')
    return sendError({ errorMsg: 'Please upload a CSV file', message });

  if (file.size > process.env.FILE_SIZE_MAX)
    return sendError({
      message,
      errorMsg: `Please upload a file less than equal to: ${
        process.env.FILE_SIZE_MAX / 1000000
      }MB`,
    });

  file.name = `file_${time}${path.parse(file.name).ext}`;
  const filePath = `${process.env.FILE_UPLOAD_PATH}/${file.name}`;
  file.mv(filePath, async (err) => {
    if (err) return next(new ErrorCatcher(err.message, 500));

    const csv = csvGetter(filePath);
    const { QUERIES, user, method, baseUrl, originalUrl } = req || {};
    const child_process = fork(path.join(__dirname + '/CsvUploadAndEvents.js'));
    child_process.send(
      JSON.stringify({ QUERIES, body: csv, user, method, originalUrl, baseUrl })
    );
    child_process.on('message', (message) => {
      const { success, data, code, error } = message;
      if (success) {
        return res.status(code).json({ success, data });
      } else {
        return next(new ErrorCatcher(error, code));
      }
    });
  });
};

exports.imageUploads = async ({ req, schema, searchParams, field, action }) => {
  const time = new Date().getTime();
  const { QUERIES: q, user } = req;
  const ID = searchParams;

  if (!user) return { error: 'Unauthorized user', code: 401 };
  if (user.isDisabled)
    return {
      error: 'Error: Kindly contact system administrator',
      code: 401,
    };

  if (!ID) return { error: 'Searching params is required', code: 400 };
  if (!schema)
    return {
      error: 'Internal error Schema is required',
      code: 500,
    };

  const feeder = await schema.findOne(`where ${ID} = '${q.hasId}'`);

  if (!feeder) {
    return { error: 'No result found', code: 400 };
  }

  if (!req.files) return { error: 'Please upload a file', code: 400 };

  const file = req.files.file;

  if (!file.mimetype.startsWith('image')) {
    return { error: 'Please upload an image file', code: 400 };
  }

  if (file.size > process.env.FILE_SIZE_MAX) {
    return {
      error: `Please upload an image less than equal ${
        process.env.FILE_SIZE_MAX / 1000000
      }MB`,
      code: 400,
    };
  }

  file.name = `photo_${feeder[field]}_${time}${path.parse(file.name).ext}`;
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) return { error: 'Problem error with file uplaod', code: 500 };

    await schema.UpdateDocument(q.hasId, { [field]: file.name });
  });

  return 'Image uploaded successfully...';
};
