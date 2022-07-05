const { bodyAppParser } = require('../context/_task/bodyApplicationParser');
const POST = require('../context/_task/C');
const GET = require('../context/_task/G');
const { NM, ND } = require('./Types');

process.on('message', async (message) => {
  const req = JSON.parse(message);
  const response = {
    error: 'Access denied',
    success: false,
    data: undefined,
    code: 500,
  };
  const { method, QUERIES } = req;
  const body_parser = bodyAppParser(req);
  req.body = body_parser;

  const ps = ['POST', 'PUT', NM(), ND()];

  if (ps.includes(method) || ps.includes(QUERIES.role)) {
    const rs = await POST(req);
    const { error, code, data, success } = rs;
    response.error = error;
    response.code = code;
    response.data = data;
    response.success = success;
  }

  process.send(response);

  process.exit();
});
