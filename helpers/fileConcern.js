const path = require('path')
const fs = require('fs')
const { csvGetter } = require('./essential')
const { ResponseBack } = require('../context/_task/_task_tools')
const ErrorCatcher = require('../utils/errorCatcher')
const { bodyAppParser } = require('../context/_task/bodyApplicationParser')
const ControllerProcess = require('../controller/Controller')

exports.readCSVFile = async ({ req, res, next }) => {
  const { user, files } = req || {}
  const message = {
    error: undefined,
    success: false,
    data: undefined,
    code: 500,
  }

  if (!user) {
    message.error = 'Unauthorized user'
    return ResponseBack({ req, rs: message, res, next })
  }
  if (!files) {
    message.error = 'Pleas upload a file'
    return ResponseBack({ req, rs: message, res, next })
  }
  const file = files.file
  const time = Date.now()

  if (!file.mimetype === 'text/csv') {
    message.error = 'Please upload a CSV file'
    ;(message.code = 400), (message.success = false)
    return ResponseBack({ req, rs: message, res, next })
  }

  if (file.size > process.env.FILE_SIZE_MAX) {
    message.error = `Please upload a file less than equal to: ${
      process.env.FILE_SIZE_MAX / 1000000
    }MB`
    message.code = 400
    message.success = false
    return ResponseBack({ req, rs: message, res, next })
  }
  file.name = `file_${time}${path.parse(file.name).ext}`
  // const filePath = `${process.env.FILE_UPLOAD_PATH}/${file.name}`
  const filePath = path.join('./', 'public', 'uploads', `${file.name}`)

  file.mv(filePath, async (err) => {
    if (err) return next(new ErrorCatcher(err.message, 500))
    const csv = csvGetter(filePath)
    fs.unlinkSync(filePath)
    req.body = csv
    const bdy = bodyAppParser(req)
    req.body = bdy

    return ControllerProcess({ req, res, next })
  })
}

exports.imageUploads = async ({ req, schema, searchParams, field }) => {
  const time = new Date().getTime()
  const { QUERIES: q, user } = req
  const ID = searchParams

  if (!user) return { error: 'Unauthorized user', code: 401 }
  if (user.isDisabled)
    return {
      error: 'Error: Kindly contact system administrator',
      code: 401,
    }

  if (!ID) return { error: 'Searching params is required', code: 400 }
  if (!schema)
    return {
      error: 'Internal error Schema is required',
      code: 500,
    }

  const feeder = await schema.findOne(`where ${ID} = '${q.hasId}'`)

  if (!feeder) {
    return { error: 'No result found', code: 400 }
  }

  if (!req.files) return { error: 'Please upload a file', code: 400 }

  const file = req.files.file

  if (!file.mimetype.startsWith('image')) {
    return { error: 'Please upload an image file', code: 400 }
  }

  if (file.size > process.env.FILE_SIZE_MAX) {
    return {
      error: `Please upload an image less than equal ${
        process.env.FILE_SIZE_MAX / 1000000
      }MB`,
      code: 400,
    }
  }

  file.name = `photo_${feeder[field]}_${time}${path.parse(file.name).ext}`
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) return { error: 'Problem error with file uplaod', code: 500 }

    await schema.UpdateDocument(q.hasId, { [field]: file.name })
  })

  return 'Image uploaded successfully...'
}
