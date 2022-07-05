const POST = require('../context/_task/C');
const GET = require('../context/_task/G');
const { readCSVFile } = require('../helpers/fileConcern');

process.on('message', async (message) => {
  const req = JSON.parse(message);
  const response = {
    error: 'Access denied',
    success: false,
    data: undefined,
    code: 500,
  };

  if (req.method === 'POST') {
    const rs = await POST(req);
    const { error, code, data, success } = rs;
    response.error = error;
    response.code = code;
    response.data = data;
    response.success = success;
  } else if (req.method === 'GET') {
    const rs = await GET(req);
    const { error, code, data, success } = rs;
    response.error = error;
    response.code = code;
    response.data = data;
    response.success = success;
  }

  process.send(response);
  process.exit();
});
