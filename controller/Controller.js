const POST = require('../context/_task/C')
const GET = require('../context/_task/G')
const PUT = require('../context/_task/U')
const { ResponseBack } = require('../context/_task/_task_tools')

const ControllerProcess = async ({ req, res, next }) => {
  const { method } = req

  if (method === 'POST') {
    const rs = await POST(req)
    return ResponseBack({ req, rs, res, next })
  } else if (method === 'PUT') {
    const rs = await PUT(req)
    return ResponseBack({ req, rs, res, next })
  } else if (method === 'GET') {
    const rs = await GET(req)
    return ResponseBack({ req, rs, res, next })
  }
}

module.exports = ControllerProcess
