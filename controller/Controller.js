const { fork } = require('child_process');
const path = require('path');
const { isArray } = require('../context/essentials/usables');
const { body_recognition } = require('../context/_task/bodyApplicationParser');
const POST = require('../context/_task/C');
const GET = require('../context/_task/G');
const PUT = require('../context/_task/U');
const { ResponseBack } = require('../context/_task/_task_tools');

const ErrorCatcher = require('../utils/errorCatcher');

const ControllerProcess = async ({ req, res, next }) => {
  const { method, QUERIES, body, baseUrl, originalUrl, user } = req;
  const { queries, abbrv, role } = QUERIES || {};
  const parse_body = isArray(body) ? body.length : 1;
  const parse_queries = body_recognition({ ...queries, abbrv, role });
  const cons_post = method === 'POST' && parse_body > 1000 ? true : false;
  const cons_get =
    method === 'GET' && parse_queries.limit > 1000 ? true : false;

  if (cons_get || cons_post) {
    const child_process = fork(path.join(__dirname + '/Bulky_task.js'));
    child_process.send(
      JSON.stringify({ QUERIES, user, method, body, baseUrl, originalUrl })
    );
    child_process.on('message', (message) => {
      const { success, data, code, error } = message;
      if (success) {
        return res.status(code).json({ success, data });
      } else {
        return next(new ErrorCatcher(error, code));
      }
    });
  } else if (method === 'POST') {
    const rs = await POST(req);
    return ResponseBack({ req, rs, res, next });
  } else if (method === 'PUT') {
    const rs = await PUT(req);
    return ResponseBack({ req, rs, res, next });
  } else if (method === 'GET') {
    const rs = await GET(req);
    return ResponseBack({ req, rs, res, next });
  }
};

module.exports = ControllerProcess;
